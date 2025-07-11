import { createFileRoute } from '@tanstack/react-router';
import {
	useState,
	useCallback,
	useRef,
	useEffect,
	type ChangeEvent
} from 'react';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card.tsx';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clipboard, ArrowDownUp, Upload, File } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const Route = createFileRoute('/tools/base64-codec')({
	component: RouteComponent
});

function RouteComponent() {
	const [inputText, setInputText] = useState<string>('');
	const [outputText, setOutputText] = useState<string>('');
	const [mode, setMode] = useState<'encode' | 'decode' | 'file'>('encode');
	const [urlSafe, setUrlSafe] = useState<boolean>(false);
	const [dataUriFormat, setDataUriFormat] = useState<boolean>(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileName, setFileName] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Reset dataUriFormat when switching to decode mode
	useEffect(() => {
		if (mode !== 'file' && dataUriFormat) {
			setDataUriFormat(false);
		}
	}, [mode, dataUriFormat]);

	// Base64 encoding function
	const encodeBase64 = useCallback(() => {
		try {
			if (!inputText.trim()) {
				toast.error('请先输入需要编码的文本');
				return;
			}

			// Convert string to UTF-8 encoded bytes
			const encoder = new TextEncoder();
			const data = encoder.encode(inputText);

			// Convert bytes to base64
			let base64String = btoa(String.fromCharCode(...data));

			// Make URL-safe if needed
			if (urlSafe) {
				base64String = base64String
					.replace(/\+/g, '-')
					.replace(/\//g, '_')
					.replace(/=+$/, '');
			}

			// Format as data URI if needed
			if (dataUriFormat) {
				base64String = `data:text/plain;base64,${base64String}`;
			}

			setOutputText(base64String);
			toast.success('编码成功');
		} catch (error) {
			toast.error(
				'编码失败: ' + (error instanceof Error ? error.message : '未知错误')
			);
		}
	}, [inputText, urlSafe, dataUriFormat]);

	// Base64 decoding function
	const decodeBase64 = useCallback(() => {
		try {
			if (!inputText.trim()) {
				toast.error('请先输入需要解码的Base64文本');
				return;
			}

			// Prepare input for decoding
			let base64Input = inputText.trim();

			// Check if input is a data URI and extract the base64 part
			const dataUriMatch = base64Input.match(/^data:[^;]+;base64,(.+)$/);
			if (dataUriMatch) {
				base64Input = dataUriMatch[1];
			}

			// Handle URL-safe base64 if needed
			if (urlSafe) {
				// Replace URL-safe characters with standard Base64 characters
				base64Input = base64Input.replace(/-/g, '+').replace(/_/g, '/');

				// Add padding if needed
				while (base64Input.length % 4) {
					base64Input += '=';
				}
			}

			// Decode base64 to bytes
			const binaryString = atob(base64Input);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			// Convert bytes to string
			const decoder = new TextDecoder();
			const decodedText = decoder.decode(bytes);

			setOutputText(decodedText);
			toast.success('解码成功');
		} catch (error) {
			toast.error(
				'解码失败: ' +
					(error instanceof Error ? error.message : '无效的Base64字符串')
			);
		}
	}, [inputText, urlSafe]);

	// Handle file selection
	const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			setSelectedFile(file);
			setFileName(file.name);
			toast.success(`已选择文件: ${file.name}`);
		}
	}, []);

	// Handle file upload and encoding
	const handleFileUpload = useCallback(() => {
		if (!selectedFile) {
			toast.error('请先选择文件');
			return;
		}

		// Check file size (limit to 5MB)
		if (selectedFile.size > 5 * 1024 * 1024) {
			toast.error('文件大小不能超过5MB');
			return;
		}

		const reader = new FileReader();

		reader.onload = event => {
			try {
				if (!event.target?.result) {
					toast.error('读取文件失败');
					return;
				}

				// Get the binary data as ArrayBuffer
				const arrayBuffer = event.target.result as ArrayBuffer;
				const bytes = new Uint8Array(arrayBuffer);

				// Convert bytes to base64 - using chunks to avoid call stack size exceeded
				let binary = '';
				const chunkSize = 1024;
				for (let i = 0; i < bytes.length; i += chunkSize) {
					const chunk = bytes.slice(i, i + chunkSize);
					binary += String.fromCharCode.apply(null, Array.from(chunk));
				}
				let base64String = btoa(binary);

				// Make URL-safe if needed
				if (urlSafe) {
					base64String = base64String
						.replace(/\+/g, '-')
						.replace(/\//g, '_')
						.replace(/=+$/, '');
				}

				// Format as data URI if needed
				if (dataUriFormat) {
					const mimeType = selectedFile.type || 'application/octet-stream';
					base64String = `data:${mimeType};base64,${base64String}`;
				}

				setOutputText(base64String);
				toast.success('文件编码成功');
			} catch (error) {
				toast.error(
					'编码失败: ' + (error instanceof Error ? error.message : '未知错误')
				);
			}
		};

		reader.onerror = () => {
			toast.error('读取文件失败');
		};

		// Read the file as ArrayBuffer
		reader.readAsArrayBuffer(selectedFile);
	}, [selectedFile, urlSafe, dataUriFormat]);

	// Process function based on the current mode
	const processData = useCallback(() => {
		if (mode === 'encode') {
			encodeBase64();
		} else if (mode === 'decode') {
			decodeBase64();
		} else if (mode === 'file') {
			handleFileUpload();
		}
	}, [mode, encodeBase64, decodeBase64, handleFileUpload]);

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
								setMode(value as 'encode' | 'decode' | 'file');
								// Clear file selection when switching to decode mode
								if (value === 'decode') {
									setSelectedFile(null);
									setFileName('');
								}
								// Clear input text when switching to file mode
								if (value === 'file') {
									setInputText('');
								}
							}}
							className='w-full'
						>
							<TabsList className='grid w-full grid-cols-3'>
								<TabsTrigger value='encode'>文本编码</TabsTrigger>
								<TabsTrigger value='file'>文件编码</TabsTrigger>
								<TabsTrigger value='decode'>Base64 解码</TabsTrigger>
							</TabsList>
						</Tabs>

						{/* Options */}
						<div className='flex flex-col space-y-2'>
							<div className='flex items-center space-x-2'>
								<Checkbox
									id='urlSafe'
									checked={urlSafe}
									onCheckedChange={checked => setUrlSafe(!!checked)}
								/>
								<Label htmlFor='urlSafe' className='cursor-pointer text-sm'>
									URL 安全模式 (使用 &#39;-&#39; 和 &#39;_&#39; 替代 &#39;+&#39;
									和 &#39;/&#39;)
								</Label>
							</div>
							<div
								className='flex items-center space-x-2'
								hidden={mode !== 'file'}
							>
								<Checkbox
									id='dataUriFormat'
									checked={dataUriFormat}
									onCheckedChange={checked => setDataUriFormat(!!checked)}
									disabled={mode !== 'file'}
								/>
								<Label
									htmlFor='dataUriFormat'
									className='cursor-pointer text-sm'
								>
									Data URI 格式 (输出 data:[mediatype];base64,{'{data}'} 格式)
								</Label>
							</div>
						</div>

						{/* Input Section - Only visible in encode and decode modes */}
						{(mode === 'encode' || mode === 'decode') && (
							<div className='space-y-2'>
								<Label htmlFor='input' className='text-sm font-medium'>
									{mode === 'encode' ? '输入文本' : '输入 Base64'}
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
												: '输入需要解码的Base64文本...'
										}
									/>
								</div>
							</div>
						)}

						{/* File Upload Section (only visible in file mode) */}
						{mode === 'file' && (
							<div className='space-y-2'>
								<Label className='text-sm font-medium'>上传文件进行编码</Label>
								<div className='flex flex-col space-y-2'>
									<div className='flex items-center gap-2'>
										<Input
											ref={fileInputRef}
											type='file'
											onChange={handleFileChange}
											className='hidden'
											id='file-upload'
										/>
										<Button
											type='button'
											variant='outline'
											onClick={() => fileInputRef.current?.click()}
											className='flex items-center gap-2'
										>
											<Upload className='h-4 w-4' /> 选择文件
										</Button>
									</div>
									{fileName && (
										<div className='text-muted-foreground flex items-center gap-2 text-sm'>
											<File className='h-4 w-4' /> {fileName}
										</div>
									)}
									<p className='text-muted-foreground text-xs'>
										支持所有文件类型，最大文件大小: 5MB
									</p>
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className='flex flex-row justify-between gap-4'>
							<Button
								onClick={processData}
								className='flex items-center justify-center gap-2'
							>
								{mode === 'encode'
									? '编码'
									: mode === 'file'
										? '编码文件'
										: '解码'}
							</Button>
							{mode !== 'file' && (
								<Button
									variant='outline'
									onClick={swapTexts}
									className='flex items-center justify-center gap-2'
									disabled={!outputText}
								>
									<ArrowDownUp className='h-4 w-4' /> 交换
								</Button>
							)}
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
								{mode === 'encode'
									? 'Base64 结果'
									: mode === 'file'
										? '文件 Base64 结果'
										: '解码结果'}
							</Label>
							<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
								<Textarea
									id='output'
									className='min-h-[150px] w-full resize-y bg-transparent font-mono text-sm'
									value={outputText}
									readOnly
									placeholder={
										mode === 'encode'
											? 'Base64 编码结果...'
											: mode === 'file'
												? '文件编码结果...'
												: '解码后的文本...'
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
