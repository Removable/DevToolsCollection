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
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/tools/base64-codec')({
	component: RouteComponent
});

function RouteComponent() {
	const { t } = useTranslation();
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
				toast.error(t('base64Codec.noInputText'));
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
			toast.success(t('base64Codec.encodeSuccess'));
		} catch (error) {
			toast.error(
				t('base64Codec.encodeError', {
					error:
						error instanceof Error
							? error.message
							: t('base64Codec.unknownError')
				})
			);
		}
	}, [inputText, urlSafe, dataUriFormat, t]);

	// Base64 decoding function
	const decodeBase64 = useCallback(() => {
		try {
			if (!inputText.trim()) {
				toast.error(t('base64Codec.noInputBase64'));
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
			toast.success(t('base64Codec.decodeSuccess'));
		} catch (error) {
			toast.error(
				t('base64Codec.decodeError', {
					error:
						error instanceof Error
							? error.message
							: t('base64Codec.invalidBase64')
				})
			);
		}
	}, [inputText, urlSafe, t]);

	// Handle file selection
	const handleFileChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0] || null;
			if (file) {
				setSelectedFile(file);
				setFileName(file.name);
				toast.success(t('base64Codec.fileSelected', { name: file.name }));
			}
		},
		[t]
	);

	// Handle file upload and encoding
	const handleFileUpload = useCallback(() => {
		if (!selectedFile) {
			toast.error(t('base64Codec.noFile'));
			return;
		}

		// Check file size (limit to 5MB)
		if (selectedFile.size > 5 * 1024 * 1024) {
			toast.error(t('base64Codec.fileSizeExceeded'));
			return;
		}

		const reader = new FileReader();

		reader.onload = event => {
			try {
				if (!event.target?.result) {
					toast.error(t('base64Codec.fileReadError'));
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
				toast.success(t('base64Codec.fileEncodeSuccess'));
			} catch (error) {
				toast.error(
					t('base64Codec.encodeError', {
						error:
							error instanceof Error
								? error.message
								: t('base64Codec.unknownError')
					})
				);
			}
		};

		reader.onerror = () => {
			toast.error(t('base64Codec.fileReadError'));
		};

		// Read the file as ArrayBuffer
		reader.readAsArrayBuffer(selectedFile);
	}, [selectedFile, urlSafe, dataUriFormat, t]);

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
			toast.error(t('base64Codec.noCopyContent'));
			return;
		}

		try {
			void navigator.clipboard.writeText(outputText);
			toast.success(t('base64Codec.copiedToClipboard'));
		} catch {
			toast.error(t('base64Codec.copyFailed'));
		}
	}, [outputText, t]);

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
								<TabsTrigger value='encode'>
									{t('base64Codec.textEncode')}
								</TabsTrigger>
								<TabsTrigger value='file'>
									{t('base64Codec.fileEncode')}
								</TabsTrigger>
								<TabsTrigger value='decode'>
									{t('base64Codec.decode')}
								</TabsTrigger>
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
									{t('base64Codec.urlSafeMode')}
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
									{t('base64Codec.dataUriFormat')}
								</Label>
							</div>
						</div>

						{/* Input Section - Only visible in encode and decode modes */}
						{(mode === 'encode' || mode === 'decode') && (
							<div className='space-y-2'>
								<Label htmlFor='input' className='text-sm font-medium'>
									{mode === 'encode'
										? t('base64Codec.inputText')
										: t('base64Codec.inputBase64')}
								</Label>
								<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
									<Textarea
										id='input'
										className='min-h-[150px] w-full resize-y bg-transparent font-mono text-sm'
										value={inputText}
										onChange={e => setInputText(e.target.value)}
										placeholder={
											mode === 'encode'
												? t('base64Codec.inputTextPlaceholder')
												: t('base64Codec.inputBase64Placeholder')
										}
									/>
								</div>
							</div>
						)}

						{/* File Upload Section (only visible in file mode) */}
						{mode === 'file' && (
							<div className='space-y-2'>
								<Label className='text-sm font-medium'>
									{t('base64Codec.uploadFile')}
								</Label>
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
											<Upload className='h-4 w-4' />{' '}
											{t('base64Codec.selectFile')}
										</Button>
									</div>
									{fileName && (
										<div className='text-muted-foreground flex items-center gap-2 text-sm'>
											<File className='h-4 w-4' /> {fileName}
										</div>
									)}
									<p className='text-muted-foreground text-xs'>
										{t('base64Codec.fileSupport')}
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
									? t('base64Codec.encode')
									: mode === 'file'
										? t('base64Codec.encodeFile')
										: t('base64Codec.decode')}
							</Button>
							{mode !== 'file' && (
								<Button
									variant='outline'
									onClick={swapTexts}
									className='flex items-center justify-center gap-2'
									disabled={!outputText}
								>
									<ArrowDownUp className='h-4 w-4' /> {t('base64Codec.swap')}
								</Button>
							)}
							<Button
								variant='outline'
								onClick={handleCopy}
								className='flex items-center justify-center gap-2'
								disabled={!outputText}
							>
								<Clipboard className='h-4 w-4' /> {t('base64Codec.copyResult')}
							</Button>
						</div>

						{/* Output Section */}
						<div className='space-y-2'>
							<Label htmlFor='output' className='text-sm font-medium'>
								{mode === 'encode'
									? t('base64Codec.base64Result')
									: mode === 'file'
										? t('base64Codec.fileBase64Result')
										: t('base64Codec.decodeResult')}
							</Label>
							<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
								<Textarea
									id='output'
									className='min-h-[150px] w-full resize-y bg-transparent font-mono text-sm'
									value={outputText}
									readOnly
									placeholder={
										mode === 'encode'
											? t('base64Codec.base64ResultPlaceholder')
											: mode === 'file'
												? t('base64Codec.fileResultPlaceholder')
												: t('base64Codec.decodeResultPlaceholder')
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
