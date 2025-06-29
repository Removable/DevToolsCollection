import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card.tsx';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clipboard, ArrowDownUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export const Route = createFileRoute('/tools/url-codec')({
	component: RouteComponent
});

function RouteComponent() {
	const [inputText, setInputText] = useState<string>('');
	const [outputText, setOutputText] = useState<string>('');
	const [mode, setMode] = useState<'encode' | 'decode'>('encode');
	const [encodeSpaces, setEncodeSpaces] = useState<boolean>(true);
	const [encodeAll, setEncodeAll] = useState<boolean>(false);

	// URL encoding function
	const encodeUrl = useCallback(() => {
		try {
			if (!inputText.trim()) {
				toast.error('请先输入需要编码的文本');
				return;
			}

			let encodedText: string;

			if (encodeAll) {
				// Encode all characters
				encodedText = [...inputText]
					.map(char => {
						return (
							'%' +
							char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()
						);
					})
					.join('');
			} else {
				// Standard URL encoding
				encodedText = encodeURIComponent(inputText);

				// Handle spaces based on user preference
				if (!encodeSpaces) {
					encodedText = encodedText.replace(/%20/g, '+');
				}
			}

			setOutputText(encodedText);
			toast.success('编码成功');
		} catch (error) {
			toast.error(
				'编码失败: ' + (error instanceof Error ? error.message : '未知错误')
			);
		}
	}, [inputText, encodeSpaces, encodeAll]);

	// URL decoding function
	const decodeUrl = useCallback(() => {
		try {
			if (!inputText.trim()) {
				toast.error('请先输入需要解码的URL文本');
				return;
			}

			// Replace + with space first if needed
			let textToProcess = inputText;
			if (textToProcess.includes('+')) {
				textToProcess = textToProcess.replace(/\+/g, ' ');
			}

			// Try to decode the URL
			const decodedText = decodeURIComponent(textToProcess);

			setOutputText(decodedText);
			toast.success('解码成功');
		} catch (error) {
			toast.error(
				'解码失败: ' +
					(error instanceof Error ? error.message : '无效的URL编码字符串')
			);
		}
	}, [inputText]);

	// Process function based on the current mode
	const processData = useCallback(() => {
		if (mode === 'encode') {
			encodeUrl();
		} else if (mode === 'decode') {
			decodeUrl();
		}
	}, [mode, encodeUrl, decodeUrl]);

	// Swap input and output
	const swapTexts = useCallback(() => {
		setInputText(outputText);
		setOutputText('');
	}, [outputText]);

	// Copy output to clipboard
	const handleCopy = useCallback(() => {
		if (!outputText) {
			toast.error('没有可复制的内容');
			return;
		}

		try {
			void navigator.clipboard.writeText(outputText);
			toast.success('已复制到剪贴板');
		} catch {
			toast.error('复制到剪贴板失败');
		}
	}, [outputText]);

	return (
		<ToolPageLayout>
			<div className='container mx-auto w-full max-w-4xl px-4 py-8'>
				<Card className='bg-card/50 border-border/40 w-full border p-8 shadow-lg backdrop-blur-sm'>
					<div className='mb-8 space-y-6'>
						{/* Mode Selection Tabs */}
						<Tabs
							defaultValue='encode'
							value={mode}
							onValueChange={value => {
								setMode(value as 'encode' | 'decode');
								// Reset options when switching modes
								if (value === 'decode') {
									setEncodeAll(false);
								}
							}}
							className='w-full'
						>
							<TabsList className='grid w-full grid-cols-2'>
								<TabsTrigger value='encode'>URL 编码</TabsTrigger>
								<TabsTrigger value='decode'>URL 解码</TabsTrigger>
							</TabsList>
						</Tabs>

						{/* Options - Only visible in encode mode */}
						{mode === 'encode' && (
							<div className='flex flex-col space-y-2'>
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='encodeSpaces'
										checked={encodeSpaces}
										onCheckedChange={checked => setEncodeSpaces(!!checked)}
									/>
									<Label
										htmlFor='encodeSpaces'
										className='cursor-pointer text-sm'
									>
										将空格编码为 %20（不选则编码为 +）
									</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='encodeAll'
										checked={encodeAll}
										onCheckedChange={checked => setEncodeAll(!!checked)}
									/>
									<Label htmlFor='encodeAll' className='cursor-pointer text-sm'>
										编码所有字符（包括非保留字符）
									</Label>
								</div>
							</div>
						)}

						{/* Input Section */}
						<div className='space-y-2'>
							<Label htmlFor='input' className='text-sm font-medium'>
								{mode === 'encode' ? '输入文本' : '输入 URL 编码文本'}
							</Label>
							<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
								<Textarea
									id='input'
									className='min-h-[150px] w-full resize-y bg-transparent font-mono text-sm'
									value={inputText}
									onChange={e => setInputText(e.target.value)}
									placeholder={
										mode === 'encode'
											? '输入需要编码的文本...'
											: '输入需要解码的URL编码文本...'
									}
								/>
							</div>
						</div>

						{/* Action Buttons */}
						<div className='flex flex-row justify-between gap-4'>
							<Button
								onClick={processData}
								className='flex items-center justify-center gap-2'
							>
								{mode === 'encode' ? 'URL 编码' : 'URL 解码'}
							</Button>
							<Button
								variant='outline'
								onClick={swapTexts}
								className='flex items-center justify-center gap-2'
								disabled={!outputText}
							>
								<ArrowDownUp className='h-4 w-4' /> 交换
							</Button>
							<Button
								variant='outline'
								onClick={handleCopy}
								className='flex items-center justify-center gap-2'
								disabled={!outputText}
							>
								<Clipboard className='h-4 w-4' /> 复制结果
							</Button>
						</div>

						{/* Output Section */}
						<div className='space-y-2'>
							<Label htmlFor='output' className='text-sm font-medium'>
								{mode === 'encode' ? 'URL 编码结果' : 'URL 解码结果'}
							</Label>
							<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
								<Textarea
									id='output'
									className='min-h-[150px] w-full resize-y bg-transparent font-mono text-sm'
									value={outputText}
									readOnly
									placeholder={
										mode === 'encode' ? 'URL 编码结果...' : '解码后的文本...'
									}
								/>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</ToolPageLayout>
	);
}
