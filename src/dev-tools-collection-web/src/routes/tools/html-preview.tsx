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
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/tools/html-preview')({
	component: RouteComponent
});

// HTML formatting function
function formatHTML(html: string): string {
	let formatted = '';
	let indent = '';

	// Simple HTML formatting logic
	const tags = html.split(/(<\/?[^>]+>)/g);
	for (let i = 0; i < tags.length; i++) {
		const tag = tags[i];

		// Skip empty strings
		if (!tag.trim()) continue;

		// Handle closing tags
		if (tag.startsWith('</')) {
			indent = indent.slice(2); // Reduce indentation
			formatted += indent + tag + '\n';
		}
		// Handle self-closing tags
		else if (tag.endsWith('/>')) {
			formatted += indent + tag + '\n';
		}
		// Handle opening tags
		else if (tag.startsWith('<')) {
			formatted += indent + tag + '\n';
			// Don't increase indentation for these tags
			if (
				!tag.includes('<img') &&
				!tag.includes('<input') &&
				!tag.includes('<br') &&
				!tag.includes('<hr') &&
				!tag.includes('<meta') &&
				!tag.includes('<link')
			) {
				indent += '  '; // Increase indentation
			}
		}
		// Handle tag content
		else {
			const content = tag.trim();
			if (content) {
				formatted += indent + content + '\n';
			}
		}
	}

	return formatted;
}

// CSS formatting function
function formatCSS(css: string): string {
	// Remove extra spaces and comments
	css = css.replace(/\/\*[\s\S]*?\*\//g, '');
	css = css.replace(/([^0-9a-zA-Z.#])\s+/g, '$1');
	css = css.replace(/\s+([^0-9a-zA-Z.#]+)/g, '$1');
	css = css.replace(/;}/g, '}');

	// Add appropriate line breaks and indentation
	let formatted = '';
	let indent = '';

	// Add line break after each {, and increase indentation
	// Reduce indentation before each }, and add line break after
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
	const { t } = useTranslation();
	const editorRef = useRef<ReactCodeMirrorRef>(null);
	const [code, setCode] = useState<string>(() => {
		// Create sample HTML with translations
		return `<!DOCTYPE html>
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
    <h1>${t('htmlPreview.sampleTitle')}</h1>
    <p>${t('htmlPreview.sampleDescription')}</p>
    <p>${t('htmlPreview.sampleSupport')}</p>
  </div>
</body>
</html>`;
	});

	// Create a safe HTML preview
	const [previewSrc, setPreviewSrc] = useState<string>('');

	// Update preview content
	const updatePreview = useCallback((htmlCode: string) => {
		// Ensure HTML contains correct charset declaration
		let processedHtml = htmlCode;

		// Check if charset declaration already exists
		if (
			!processedHtml.includes('<meta charset="utf-8"') &&
			!processedHtml.includes('<meta charset="UTF-8"') &&
			!processedHtml.includes('charset=utf-8') &&
			!processedHtml.includes('charset=UTF-8')
		) {
			// Add charset declaration to head tag
			if (processedHtml.includes('<head>')) {
				processedHtml = processedHtml.replace(
					'<head>',
					'<head>\n  <meta charset="UTF-8">'
				);
			} else if (processedHtml.includes('<html>')) {
				// If no head tag but html tag exists, add head tag and charset declaration
				processedHtml = processedHtml.replace(
					'<html>',
					'<html>\n<head>\n  <meta charset="UTF-8">\n</head>'
				);
			} else {
				// If not even html tag exists, add complete declaration at the beginning
				processedHtml =
					'<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n</head>\n' +
					processedHtml;
			}
		}

		// Create a Blob object to generate preview URL, specify MIME type and charset
		const blob = new Blob([processedHtml], { type: 'text/html;charset=UTF-8' });
		const url = URL.createObjectURL(blob);

		// Update preview source
		setPreviewSrc(url);

		// Clean up previous URL
		return () => {
			URL.revokeObjectURL(url);
		};
	}, []);

	// Update preview
	useEffect(() => {
		updatePreview(code);
	}, [code, updatePreview]);

	// Format code
	const handleFormat = useCallback(() => {
		try {
			if (!code.trim()) {
				toast.error(t('htmlPreview.noHtmlCode'));
				return;
			}

			// Extract HTML and CSS parts
			let formattedCode = code;

			// Format HTML
			formattedCode = formatHTML(formattedCode);

			// Format CSS (find content inside style tags)
			const styleRegex = /<style>([\s\S]*?)<\/style>/g;
			formattedCode = formattedCode.replace(
				styleRegex,
				(_match, cssContent) => {
					const formattedCSS = formatCSS(cssContent);
					return `<style>\n  ${formattedCSS.replace(/\n/g, '\n  ')}\n</style>`;
				}
			);

			setCode(formattedCode);
			toast.success(t('htmlPreview.formatSuccess'));
		} catch (error) {
			toast.error(
				t('htmlPreview.formatError', {
					error:
						error instanceof Error
							? error.message
							: t('base64Codec.unknownError')
				})
			);
		}
	}, [code, t]);

	// Copy code to clipboard
	const handleCopy = useCallback(() => {
		try {
			void navigator.clipboard.writeText(code);
			toast.success(t('htmlPreview.copiedToClipboard'));
		} catch {
			toast.error(t('htmlPreview.copyFailed'));
		}
	}, [code, t]);

	// Refresh preview
	const handleRefresh = useCallback(() => {
		updatePreview(code);
		toast.success(t('htmlPreview.previewRefreshed'));
	}, [code, updatePreview, t]);

	// Configure CodeMirror extensions
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
							<span className='text-lg font-medium'>
								{t('htmlPreview.title')}
							</span>
						</div>
						<div className='flex space-x-3'>
							<Button
								variant='outline'
								onClick={handleFormat}
								className='flex items-center gap-2'
							>
								<Code className='h-4 w-4' /> {t('htmlPreview.formatCode')}
							</Button>
							<Button
								variant='outline'
								onClick={handleCopy}
								className='flex items-center gap-2'
							>
								<Clipboard className='h-4 w-4' /> {t('htmlPreview.copyCode')}
							</Button>
							<Button
								variant='outline'
								onClick={handleRefresh}
								className='flex items-center gap-2'
							>
								<RefreshCw className='h-4 w-4' />{' '}
								{t('htmlPreview.refreshPreview')}
							</Button>
						</div>
					</div>

					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						{/* Code Editor */}
						<div className='bg-background flex w-full overflow-hidden rounded-md border'>
							<CodeMirror
								ref={editorRef}
								className='bg-background w-full'
								value={code}
								onChange={setCode}
								extensions={extensions}
								theme={whiteLight}
								height='600px'
								placeholder={t('htmlPreview.codePlaceholder')}
							/>
						</div>

						{/* Preview Area */}
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
