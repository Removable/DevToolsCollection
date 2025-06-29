import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useRef, useState, useMemo } from 'react';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card.tsx';
import {
	Code,
	CodeXml,
	FileArchive,
	ScanLine,
	CheckCircle,
	AlertCircle,
	Clipboard
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label.tsx';
import parseJson, { JSONError } from 'parse-json';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { whiteLight } from '@uiw/codemirror-theme-white';
import { EditorView, Decoration, type DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { linter, type Diagnostic } from '@codemirror/lint';

export const Route = createFileRoute('/tools/json-formatter')({
	component: RouteComponent
});

// 定义一个 StateEffect 来设置错误行
const setErrorLine = StateEffect.define<{
	line: number;
	message: string;
} | null>();

// 创建一个 StateField 来存储错误行高亮装饰
const errorLineField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(decorations, tr) {
		decorations = decorations.map(tr.changes);
		for (const e of tr.effects) {
			if (e.is(setErrorLine)) {
				if (e.value === null) {
					decorations = Decoration.none;
				} else {
					const line = tr.state.doc.line(e.value.line);
					decorations = Decoration.set([
						Decoration.line({
							attributes: { class: 'cm-error-line' }
						}).range(line.from)
					]);
				}
			}
		}
		return decorations;
	},
	provide: f => EditorView.decorations.from(f)
});

const getJsonErrorInfo = (
	error: unknown,
	jsonString: string
): ErrorInfo | null => {
	if (error instanceof JSONError) {
		let line = 1;
		let column = 1;
		let position = 0;
		let message = '无效的 JSON 格式';

		if (error.message) {
			// console.log('cause:', error['cause']);
			const match = error.message.match(
				/at position (\d+) \(line (\d+) column (\d+)\)/
			);
			if (match) {
				position = parseInt(match[1], 10);
				line = parseInt(match[2], 10);
				column = parseInt(match[3], 10);
			} else if (error.message.includes('is not valid JSON')) {
				const reg = /\.\.\."([\s\S]*?)"\.\.\./g;
				const matchError = error.message.match(reg);
				if (matchError && matchError[0]) {
					const errorPart = matchError[0].replace(/\.\.\."|"\.\.\./g, '');
					position = jsonString.indexOf(errorPart);
					// 计算行和列
					const lines = jsonString.slice(0, position).split('\n');
					line = lines.length;
					// 获取第<line>行的完整内容
					const lineContent = jsonString.split('\n')[line - 1];
					// 获取第<line>行的中第一个冒号的位置
					const colonIndex = lineContent.indexOf(':');
					position += 10; // 修正位置
					column = colonIndex + 1;

					message = `无效的 JSON 格式: ${errorPart}`;
				}
			}

			if (error.message.includes('Unexpected token')) {
				message = `Unexpected token: ${error.message.split('"')[1] || 'Unknown'}`;
			} else if (error.message.includes('Unexpected end')) {
				message = 'JSON is incomplete, possibly missing closing symbols';
			} else if (error.message.includes('Expected')) {
				message = error.message.split(' in JSON')[0];
			}
		}

		return { line, column, position, message };
	}
	return null;
};

// JSON 验证函数，返回诊断信息
const jsonLinter = linter(view => {
	const diagnostics: Diagnostic[] = [];
	const doc = view.state.doc.toString();

	if (!doc.trim()) return diagnostics;

	try {
		parseJson(doc);
	} catch (error) {
		if (error instanceof JSONError) {
			const errorInfo = getJsonErrorInfo(error, doc);
			if (!errorInfo) return diagnostics;

			diagnostics.push({
				from: errorInfo.position,
				to: errorInfo.position,
				severity: 'error',
				message: errorInfo.message
			});
		}
	}
	return diagnostics;
});

function RouteComponent() {
	const editorRef = useRef<ReactCodeMirrorRef>(null);
	const [jsonInput, setJsonInput] = useState('');
	const [indentSize, setIndentSize] = useState(2);
	const [errorInfo, setErrorInfo] = useState<{
		line: number;
		message: string;
	} | null>(null);

	const [alertInfo, setAlertInfo] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);

	// 配置 CodeMirror 扩展
	const extensions = useMemo(
		() => [
			json(),
			errorLineField,
			jsonLinter,
			EditorView.theme({
				'.cm-error-line': {
					backgroundColor: '#fee',
					borderLeft: '3px solid #f87171'
				},
				'.cm-diagnostic-error': {
					borderBottom: '2px wavy #f87171'
				},
				'.cm-editor.cm-focused': {
					outline: 'none !important'
				},
				'.cm-theme.mt-4': {
					marginTop: '0 !important'
				},
				'.cm-theme.border': {
					border: 'none !important'
				}
			})
		],
		[]
	);

	// Handle input changes
	const handleInputChange = (value: string): void => {
		setJsonInput(value);
	};

	// Format JSON nicely with indentation
	const handleFormat = useCallback(() => {
		try {
			if (!jsonInput.trim()) {
				setAlertInfo({
					type: 'error',
					message: '请先输入有效的 JSON 数据'
				});
				return;
			}

			const parsedJson = parseJson(jsonInput);
			const formatted = JSON.stringify(parsedJson, null, indentSize);
			setJsonInput(formatted);

			// 清除错误状态
			setErrorInfo(null);
			if (editorRef.current?.view) {
				editorRef.current.view.dispatch({
					effects: setErrorLine.of(null)
				});
			}

			setAlertInfo({
				type: 'success',
				message: '有效的 JSON 格式'
			});
		} catch (error: unknown) {
			const errorInfo = getJsonErrorInfo(error, jsonInput);
			if (!errorInfo) {
				setAlertInfo({
					type: 'error',
					message: '无效的 JSON 格式'
				});
				return;
			}

			setAlertInfo({
				type: 'error',
				message: errorInfo.message
			});

			// 跳转到错误行
			if (editorRef.current?.view) {
				const view = editorRef.current.view;
				const lineObj = view.state.doc.line(errorInfo.line);
				view.dispatch({
					selection: { anchor: lineObj.from + 20 },
					// selection: { anchor: lineObj.from + errorInfo.column - 1 },
					effects: [
						setErrorLine.of({
							line: errorInfo.line,
							message: errorInfo.message
						}),
						EditorView.scrollIntoView(errorInfo.position)
					]
				});
			}
		}
	}, [jsonInput, indentSize]);

	// Compress JSON by removing all whitespace
	const handleCompress = () => {
		try {
			if (!jsonInput.trim()) {
				setAlertInfo({
					type: 'error',
					message: '请先输入有效的 JSON 数据'
				});
				return;
			}

			const parsedJson = parseJson(jsonInput);
			const compressed = JSON.stringify(parsedJson);
			setJsonInput(compressed);

			setAlertInfo(null);
		} catch {
			setAlertInfo({
				type: 'error',
				message: '无效的 JSON 格式'
			});
		}
	};

	// Escape JSON string
	const handleEscape = () => {
		try {
			// 首先验证是否为有效的 JSON
			if (jsonInput.trim()) {
				parseJson(jsonInput);
			}

			const escaped = JSON.stringify(jsonInput);
			// 去掉首尾的引号
			setJsonInput(escaped.slice(1, -1));

			setAlertInfo({
				type: 'success',
				message: 'JSON 已转义'
			});
		} catch {
			setAlertInfo({
				type: 'error',
				message: '处理 JSON 时出错'
			});
		}
	};

	// Unescape JSON string
	const handleUnescape = () => {
		try {
			// 添加引号使其成为有效的 JSON 字符串
			const withQuotes = `"${jsonInput}"`;
			const unescaped = JSON.parse(withQuotes);
			setJsonInput(unescaped);

			setAlertInfo({
				type: 'success',
				message: '已去除转义'
			});
		} catch {
			setAlertInfo({
				type: 'error',
				message: '处理 JSON 时出错'
			});
		}
	};

	// Copy JSON to clipboard
	const handleCopy = () => {
		try {
			void navigator.clipboard.writeText(jsonInput);
			setAlertInfo({
				type: 'success',
				message: '已复制到剪贴板'
			});
		} catch {
			setAlertInfo({
				type: 'error',
				message: '复制到剪贴板失败'
			});
		}
	};

	return (
		<ToolPageLayout>
			<div className='container mx-auto w-full px-4 py-8'>
				<Card className='bg-card/50 border-border/40 w-full border p-6 shadow-lg backdrop-blur-sm'>
					<div className='mb-4 flex items-center justify-between'>
						<div className='flex items-center space-x-4'>
							<span className='text-sm font-medium'>缩进量:</span>
							<RadioGroup
								value={String(indentSize)}
								onValueChange={e => setIndentSize(Number(e))}
								className='flex items-center space-x-4'
							>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='2' id='indent-2' />
									<Label htmlFor='indent-2' className='text-sm'>
										2 个空格
									</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='4' id='indent-4' />
									<Label htmlFor='indent-4' className='text-sm'>
										4 个空格
									</Label>
								</div>
							</RadioGroup>
						</div>
						<div className='flex space-x-3'>
							<Button
								variant='outline'
								onClick={handleFormat}
								className='flex items-center gap-2'
							>
								<ScanLine className='h-4 w-4' /> 校验并格式化
							</Button>
							<Button
								variant='outline'
								onClick={handleCompress}
								className='flex items-center gap-2'
							>
								<FileArchive className='h-4 w-4' /> 压缩
							</Button>
							<Button
								variant='outline'
								onClick={handleEscape}
								className='flex items-center gap-2'
							>
								<CodeXml className='h-4 w-4' /> 转义
							</Button>
							<Button
								variant='outline'
								onClick={handleUnescape}
								className='flex items-center gap-2'
							>
								<Code className='h-4 w-4' /> 去除转义
							</Button>
							<Button
								variant='outline'
								onClick={handleCopy}
								className='flex items-center gap-2'
							>
								<Clipboard className='h-4 w-4' /> 复制
							</Button>
						</div>
					</div>

					{/* 错误提示 */}
					{errorInfo && (
						<div className='mb-4 rounded-md border border-red-200 bg-red-50 p-3'>
							<p className='text-sm text-red-800'>
								<span className='font-semibold'>
									第 {errorInfo.line} 行错误：
								</span>
								{errorInfo.message}
							</p>
						</div>
					)}

					<div>
						{alertInfo && (
							<div
								className={`mb-4 flex items-center rounded-md border p-3 ${
									alertInfo.type === 'success'
										? 'border-green-200 bg-green-50'
										: 'border-red-200 bg-red-50'
								}`}
							>
								{alertInfo.type === 'success' ? (
									<CheckCircle className='mr-2 h-5 w-5 text-green-500' />
								) : (
									<AlertCircle className='mr-2 h-5 w-5 text-red-500' />
								)}
								<p
									className={`text-sm ${
										alertInfo.type === 'success'
											? 'text-green-800'
											: 'text-red-800'
									}`}
								>
									{alertInfo.message}
								</p>
							</div>
						)}
						<div className='bg-background flex w-full overflow-hidden rounded-md border'>
							<CodeMirror
								ref={editorRef}
								className='bg-background w-full'
								value={jsonInput}
								onChange={handleInputChange}
								extensions={extensions}
								theme={whiteLight}
								height='500px'
								placeholder='在此粘贴 JSON 数据...'
							/>
						</div>
					</div>
				</Card>
			</div>
		</ToolPageLayout>
	);
}

interface ErrorInfo {
	line: number;
	column: number;
	position: number;
	message: string;
}
