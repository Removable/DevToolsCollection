import { createFileRoute } from '@tanstack/react-router';
import {
	useCallback,
	useState,
	useMemo,
	useRef,
	useEffect,
	type ReactElement
} from 'react';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { whiteLight } from '@uiw/codemirror-theme-white';
import { EditorView, Decoration, type DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { useDebounce } from '@uidotdev/usehooks';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button';

const SlashLabel = (props: { className?: string }): ReactElement => {
	const { className } = props;

	return (
		<div
			className={cn(
				'border-input flex h-9 w-8 items-center justify-center rounded-md border bg-gray-100 shadow-xs transition-[color,box-shadow]',
				className
			)}
		>
			/
		</div>
	);
};

// 常用正则表达式模式
const commonRegexPatterns: CommonRegexPattern[] = [
	{
		name: '邮箱地址',
		pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
		flags: 'g'
	},
	{
		name: '中国大陆手机号码',
		pattern: '(13\\d|14[579]|15[^4\\D]|17[^49\\D]|18\\d|19\\d)\\d{8}',
		flags: 'g'
	},
	{
		name: 'URL',
		pattern:
			'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
		flags: 'g'
	},
	{
		name: '中国大陆身份证号',
		pattern:
			'[1-9]\\d{5}(?:19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]',
		flags: 'g'
	},
	{
		name: 'IPv4地址',
		pattern:
			'(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
		flags: 'g'
	},
	{
		name: 'IPv6地址',
		pattern:
			'(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|:)',
		flags: 'g'
	},
	{
		name: '日期',
		pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
		flags: 'g'
	},
	{ name: '中文字符', pattern: '[\u4e00-\u9fa5]+', flags: 'g' }
];

export const Route = createFileRoute('/tools/regex-tester')({
	component: RouteComponent
});

// 定义一个 StateEffect 来设置正则表达式匹配
const setRegexMatches = StateEffect.define<{
	matches: Array<{ from: number; to: number }> | null;
}>();

// 创建一个 StateField 来存储匹配高亮装饰
const regexMatchField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(decorations, tr) {
		decorations = decorations.map(tr.changes);
		for (const e of tr.effects) {
			if (e.is(setRegexMatches)) {
				if (e.value.matches === null || e.value.matches.length === 0) {
					decorations = Decoration.none;
				} else {
					const marks = e.value.matches.map(match =>
						Decoration.mark({
							class: 'bg-yellow-200 text-black'
						}).range(match.from, match.to)
					);
					decorations = Decoration.set(marks);
				}
			}
		}
		return decorations;
	},
	provide: f => EditorView.decorations.from(f)
});

function RouteComponent() {
	const editorRef = useRef<ReactCodeMirrorRef>(null);
	const [regexPattern, setRegexPattern] = useState<string | undefined>('');
	const [testText, setTestText] = useState<string | undefined>('');
	const [flags, setFlags] = useState<string | undefined>('gm');
	const [matches, setMatches] = useState<RegExpMatchArray | null>(null);
	const [error, setError] = useState<string | null>(null);

	const debouncedPattern = useDebounce(regexPattern, 500);
	const debouncedFlags = useDebounce(flags, 500);
	const debouncedTestText = useDebounce(testText, 500);

	// 配置 CodeMirror 扩展
	const extensions = useMemo(
		() => [
			regexMatchField,
			EditorView.theme({
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

	// 处理正则表达式测试
	const handleTest = useCallback(
		(pattern: string, flagsParam: string | undefined, text: string) => {
			if (!pattern) {
				setMatches(null);

				// 清除所有高亮
				if (editorRef.current?.view) {
					editorRef.current.view.dispatch({
						effects: setRegexMatches.of({ matches: null })
					});
				}
				return;
			}

			try {
				const regex = new RegExp(pattern, flagsParam);
				const matchResults = text.match(regex);
				setMatches(matchResults);
				setError(null);

				// 直接在编辑器中高亮匹配的文本
				if (editorRef.current?.view) {
					const view = editorRef.current.view;

					if (matchResults && matchResults.length > 0) {
						// 查找匹配项的位置
						const matches: Array<{ from: number; to: number }> = [];
						let match;

						// 重置正则表达式的lastIndex
						regex.lastIndex = 0;

						while ((match = regex.exec(text)) !== null) {
							matches.push({
								from: match.index,
								to: match.index + match[0].length
							});

							// 如果不是全局模式，手动退出循环以避免无限循环
							if (!regex.global) break;
						}

						// 应用高亮装饰
						view.dispatch({
							effects: setRegexMatches.of({ matches })
						});
					} else {
						// 清除所有高亮
						view.dispatch({
							effects: setRegexMatches.of({ matches: null })
						});
					}
				}
			} catch (err) {
				setError(`正则表达式错误: ${(err as Error).message}`);
				setMatches(null);

				// 清除所有高亮
				if (editorRef.current?.view) {
					editorRef.current.view.dispatch({
						effects: setRegexMatches.of({ matches: null })
					});
				}
			}
		},
		[]
	);

	// 处理常用正则表达式按钮点击
	const handleRegexButtonClick = useCallback(
		(pattern: string, patternFlags: string) => {
			setRegexPattern(pattern);
			setFlags(patternFlags);
		},
		[]
	);

	useEffect(() => {
		if (debouncedPattern && debouncedTestText) {
			handleTest(debouncedPattern, debouncedFlags, debouncedTestText);
		}
	}, [debouncedPattern, debouncedFlags, debouncedTestText, handleTest]);

	return (
		<ToolPageLayout>
			<div className='container mx-auto w-full px-4 py-8'>
				<Card className='bg-card/50 border-border/40 w-full border p-6 shadow-lg backdrop-blur-sm'>
					<div className='mb-6'>
						<div className='mb-4 flex items-center space-x-4'>
							<div className='flex-grow'>
								<Label
									htmlFor='regex-pattern'
									className='mb-2 block text-sm font-medium'
								>
									正则表达式
								</Label>
								<div className='flex items-center justify-start'>
									<SlashLabel className='rounded-r-none border-r-0' />
									<Input
										id='regex-pattern'
										value={regexPattern}
										onChange={e => setRegexPattern(e.target.value)}
										placeholder='输入正则表达式，例如: \b\w+\b'
										className='w-full max-w-[1000px] min-w-96 rounded-none'
									/>
									<SlashLabel className='rounded-none border-x-0' />
									<div className='flex items-center space-x-2'>
										<Input
											id='flags'
											value={flags}
											onChange={e => setFlags(e.target.value)}
											className='w-16 rounded-l-none'
											placeholder='标志'
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='mt-4 mb-4'>
							<Label className='mb-2 block text-sm font-medium'>
								常用正则表达式
							</Label>
							<div className='flex flex-wrap gap-2'>
								{commonRegexPatterns.map((item, index) => (
									<div key={index} className='inline-flex flex-col gap-1'>
										<Button
											variant='outline'
											size='sm'
											onClick={() =>
												handleRegexButtonClick(item.pattern, item.flags)
											}
											className='w-full'
										>
											{item.name}
										</Button>
									</div>
								))}
							</div>
						</div>

						{error && (
							<div className='mb-4 rounded-md border border-red-200 bg-red-50 p-3'>
								<p className='text-sm text-red-800'>{error}</p>
							</div>
						)}

						<div className='mb-4'>
							<Label
								htmlFor='test-text'
								className='mb-2 block text-sm font-medium'
							>
								测试文本
							</Label>
							<div className='bg-background flex w-full overflow-hidden rounded-md border'>
								<CodeMirror
									ref={editorRef}
									className='bg-background w-full'
									value={testText}
									onChange={value => {
										setTestText(value);
										// 当文本变化时，清除高亮
										if (editorRef.current?.view) {
											editorRef.current.view.dispatch({
												effects: setRegexMatches.of({ matches: null })
											});
										}
									}}
									extensions={extensions}
									theme={whiteLight}
									height='200px'
									placeholder='在此输入要测试的文本...'
								/>
							</div>
							{matches && matches.length > 0 && (
								<p className='mt-2 text-sm text-gray-600'>
									找到 {matches.length} 个匹配项
								</p>
							)}
						</div>
					</div>

					<div className='mt-8'>
						<h3 className='mb-4 text-lg font-semibold'>语法参考</h3>
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							<div className='rounded-md border p-4'>
								<h4 className='mb-2 font-medium'>字符类</h4>
								<ul className='space-y-1 text-sm'>
									<li>
										<code>.</code> - 匹配除换行符外的任何单个字符
									</li>
									<li>
										<code>\d</code> - 匹配任何数字字符 (0-9)
									</li>
									<li>
										<code>\D</code> - 匹配任何非数字字符
									</li>
									<li>
										<code>\w</code> - 匹配任何字母数字字符 (a-z, A-Z, 0-9, _)
									</li>
									<li>
										<code>\W</code> - 匹配任何非字母数字字符
									</li>
									<li>
										<code>\s</code> - 匹配任何空白字符 (空格, 制表符, 换行符等)
									</li>
									<li>
										<code>\S</code> - 匹配任何非空白字符
									</li>
								</ul>
							</div>
							<div className='rounded-md border p-4'>
								<h4 className='mb-2 font-medium'>量词</h4>
								<ul className='space-y-1 text-sm'>
									<li>
										<code>*</code> - 匹配前面的表达式 0 次或多次
									</li>
									<li>
										<code>+</code> - 匹配前面的表达式 1 次或多次
									</li>
									<li>
										<code>?</code> - 匹配前面的表达式 0 次或 1 次
									</li>
									<li>
										<code>{'{n}'}</code> - 匹配前面的表达式恰好 n 次
									</li>
									<li>
										<code>{'{n,}'}</code> - 匹配前面的表达式至少 n 次
									</li>
									<li>
										<code>{'{n,m}'}</code> - 匹配前面的表达式至少 n 次，最多 m
										次
									</li>
								</ul>
							</div>
							<div className='rounded-md border p-4'>
								<h4 className='mb-2 font-medium'>锚点</h4>
								<ul className='space-y-1 text-sm'>
									<li>
										<code>^</code> - 匹配字符串的开头
									</li>
									<li>
										<code>$</code> - 匹配字符串的结尾
									</li>
									<li>
										<code>\b</code> - 匹配单词边界
									</li>
									<li>
										<code>\B</code> - 匹配非单词边界
									</li>
								</ul>
							</div>
							<div className='rounded-md border p-4'>
								<h4 className='mb-2 font-medium'>标志</h4>
								<ul className='space-y-1 text-sm'>
									<li>
										<code>g</code> - 全局匹配 (查找所有匹配项)
									</li>
									<li>
										<code>i</code> - 忽略大小写
									</li>
									<li>
										<code>m</code> - 多行匹配
									</li>
									<li>
										<code>s</code> - 允许 . 匹配换行符
									</li>
									<li>
										<code>u</code> - Unicode 模式
									</li>
									<li>
										<code>y</code> - 粘性匹配
									</li>
								</ul>
							</div>
							<div className='rounded-md border p-4'>
								<h4 className='mb-2 font-medium'>分组和引用</h4>
								<ul className='space-y-1 text-sm'>
									<li>
										<code>(xyz)</code> - 捕获组，匹配括号内的表达式
									</li>
									<li>
										<code>(?:xyz)</code> - 非捕获组
									</li>
									<li>
										<code>\1, \2, ...</code> - 反向引用，引用之前的捕获组
									</li>
								</ul>
							</div>
							<div className='rounded-md border p-4'>
								<h4 className='mb-2 font-medium'>特殊字符</h4>
								<ul className='space-y-1 text-sm'>
									<li>
										<code>|</code> - 或运算符，匹配 | 前或后的表达式
									</li>
									<li>
										<code>[xyz]</code> - 字符集，匹配括号内的任意一个字符
									</li>
									<li>
										<code>[^xyz]</code> -
										否定字符集，匹配不在括号内的任意一个字符
									</li>
									<li>
										<code>[a-z]</code> - 字符范围，匹配指定范围内的任意一个字符
									</li>
									<li>
										<code>\</code> - 转义字符，用于匹配特殊字符本身
									</li>
								</ul>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</ToolPageLayout>
	);
}

interface CommonRegexPattern {
	name: string;
	pattern: string;
	flags: string;
}
