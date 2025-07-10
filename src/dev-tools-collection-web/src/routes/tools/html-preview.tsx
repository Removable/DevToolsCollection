import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useRef, useState, useEffect } from 'react';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card.tsx';
import { FileCode, Clipboard, Code, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { whiteLight } from '@uiw/codemirror-theme-white';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';

export const Route = createFileRoute('/tools/html-preview')({
	component: RouteComponent
});

// HTML格式化函数
function formatHTML(html: string): string {
	let formatted = '';
	let indent = '';

	// 简单的HTML格式化逻辑
	const tags = html.split(/(<\/?[^>]+>)/g);
	for (let i = 0; i < tags.length; i++) {
		const tag = tags[i];

		// 跳过空字符串
		if (!tag.trim()) continue;

		// 处理结束标签
		if (tag.startsWith('</')) {
			indent = indent.slice(2); // 减少缩进
			formatted += indent + tag + '\n';
		}
		// 处理自闭合标签
		else if (tag.endsWith('/>')) {
			formatted += indent + tag + '\n';
		}
		// 处理开始标签
		else if (tag.startsWith('<')) {
			formatted += indent + tag + '\n';
			// 不为这些标签增加缩进
			if (
				!tag.includes('<img') &&
				!tag.includes('<input') &&
				!tag.includes('<br') &&
				!tag.includes('<hr') &&
				!tag.includes('<meta') &&
				!tag.includes('<link')
			) {
				indent += '  '; // 增加缩进
			}
		}
		// 处理标签内容
		else {
			const content = tag.trim();
			if (content) {
				formatted += indent + content + '\n';
			}
		}
	}

	return formatted;
}

// CSS格式化函数
function formatCSS(css: string): string {
	// 移除多余空格和注释
	css = css.replace(/\/\*[\s\S]*?\*\//g, '');
	css = css.replace(/([^0-9a-zA-Z\.#])\s+/g, '$1');
	css = css.replace(/\s+([^0-9a-zA-Z\.#]+)/g, '$1');
	css = css.replace(/;}/g, '}');

	// 添加适当的换行和缩进
	let formatted = '';
	let indent = '';

	// 在每个 { 后添加换行，并增加缩进
	// 在每个 } 前减少缩进，并在后面添加换行
	for (let i = 0; i < css.length; i++) {
		const char = css.charAt(i);

		if (char === '{') {
			formatted += ' {\n';
			indent += '  ';
			formatted += indent;
		} else if (char === '}') {
			formatted = formatted.trim();
			formatted += '\n';
			indent = indent.slice(2);
			formatted += indent + '}\n';
			if (indent) formatted += indent;
		} else if (char === ';') {
			formatted += ';\n' + indent;
		} else {
			formatted += char;
		}
	}

	return formatted;
}

function RouteComponent() {
	const editorRef = useRef<ReactCodeMirrorRef>(null);
	const [code, setCode] = useState<string>(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
    }
    p {
      line-height: 1.6;
    }
    .highlight {
      background-color: #ffffcc;
      padding: 2px 5px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>HTML 在线预览示例</h1>
    <p>这是一个简单的 HTML 预览示例。您可以在左侧编辑器中修改代码，右侧会实时显示预览效果。</p>
    <p>支持 <span class="highlight">HTML</span> 和 <span class="highlight">CSS</span> 代码。</p>
  </div>
</body>
</html>`);

	// 创建一个安全的HTML预览
	const [previewSrc, setPreviewSrc] = useState<string>('');

	// 更新预览
	useEffect(() => {
		updatePreview(code);
	}, [code]);

	// 更新预览内容
	const updatePreview = useCallback((htmlCode: string) => {
		// 确保HTML包含正确的字符集声明
		let processedHtml = htmlCode;

		// 检查是否已经有charset声明
		if (
			!processedHtml.includes('<meta charset="utf-8"') &&
			!processedHtml.includes('<meta charset="UTF-8"') &&
			!processedHtml.includes('charset=utf-8') &&
			!processedHtml.includes('charset=UTF-8')
		) {
			// 在head标签中添加charset声明
			if (processedHtml.includes('<head>')) {
				processedHtml = processedHtml.replace(
					'<head>',
					'<head>\n  <meta charset="UTF-8">'
				);
			} else if (processedHtml.includes('<html>')) {
				// 如果没有head标签，但有html标签，添加head标签和charset声明
				processedHtml = processedHtml.replace(
					'<html>',
					'<html>\n<head>\n  <meta charset="UTF-8">\n</head>'
				);
			} else {
				// 如果连html标签都没有，在开头添加完整的声明
				processedHtml =
					'<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n</head>\n' +
					processedHtml;
			}
		}

		// 创建一个Blob对象，用于生成预览URL，指定MIME类型和字符集
		const blob = new Blob([processedHtml], { type: 'text/html;charset=UTF-8' });
		const url = URL.createObjectURL(blob);

		// 更新预览源
		setPreviewSrc(url);

		// 清理之前的URL
		return () => {
			URL.revokeObjectURL(url);
		};
	}, []);

	// 格式化代码
	const handleFormat = useCallback(() => {
		try {
			if (!code.trim()) {
				toast.error('请先输入HTML代码');
				return;
			}

			// 提取HTML和CSS部分
			let formattedCode = code;

			// 格式化HTML
			formattedCode = formatHTML(formattedCode);

			// 格式化CSS (查找style标签内的内容)
			const styleRegex = /<style>([\s\S]*?)<\/style>/g;
			formattedCode = formattedCode.replace(
				styleRegex,
				(_match, cssContent) => {
					const formattedCSS = formatCSS(cssContent);
					return `<style>\n  ${formattedCSS.replace(/\n/g, '\n  ')}\n</style>`;
				}
			);

			setCode(formattedCode);
			toast.success('代码格式化成功');
		} catch (error) {
			toast.error(
				'格式化失败: ' + (error instanceof Error ? error.message : '未知错误')
			);
		}
	}, [code]);

	// 复制代码到剪贴板
	const handleCopy = useCallback(() => {
		try {
			void navigator.clipboard.writeText(code);
			toast.success('已复制到剪贴板');
		} catch {
			toast.error('复制到剪贴板失败');
		}
	}, [code]);

	// 刷新预览
	const handleRefresh = useCallback(() => {
		updatePreview(code);
		toast.success('预览已刷新');
	}, [code, updatePreview]);

	// 配置 CodeMirror 扩展
	const extensions = [
		javascript({ jsx: true, typescript: true }),
		EditorView.theme({
			'.cm-editor.cm-focused': {
				outline: 'none !important'
			}
		})
	];

	return (
		<ToolPageLayout>
			<div className='container mx-auto w-full px-4 py-8'>
				<Card className='bg-card/50 border-border/40 w-full border p-6 shadow-lg backdrop-blur-sm'>
					<div className='mb-4 flex items-center justify-between'>
						<div className='flex items-center space-x-2'>
							<FileCode className='h-5 w-5' />
							<span className='text-lg font-medium'>HTML 在线预览工具</span>
						</div>
						<div className='flex space-x-3'>
							<Button
								variant='outline'
								onClick={handleFormat}
								className='flex items-center gap-2'
							>
								<Code className='h-4 w-4' /> 格式化代码
							</Button>
							<Button
								variant='outline'
								onClick={handleCopy}
								className='flex items-center gap-2'
							>
								<Clipboard className='h-4 w-4' /> 复制代码
							</Button>
							<Button
								variant='outline'
								onClick={handleRefresh}
								className='flex items-center gap-2'
							>
								<RefreshCw className='h-4 w-4' /> 刷新预览
							</Button>
						</div>
					</div>

					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						{/* 代码编辑器 */}
						<div className='bg-background flex w-full overflow-hidden rounded-md border'>
							<CodeMirror
								ref={editorRef}
								className='bg-background w-full'
								value={code}
								onChange={setCode}
								extensions={extensions}
								theme={whiteLight}
								height='600px'
								placeholder='在此输入HTML代码...'
							/>
						</div>

						{/* 预览区域 */}
						<div className='bg-background flex w-full overflow-hidden rounded-md border'>
							<iframe
								title='HTML Preview'
								src={previewSrc}
								className='h-[600px] w-full border-0'
								sandbox='allow-scripts'
							/>
						</div>
					</div>
				</Card>
			</div>
		</ToolPageLayout>
	);
}
