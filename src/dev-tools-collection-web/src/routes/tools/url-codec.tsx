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
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/tools/url-codec')({
	component: RouteComponent
});

function RouteComponent() {
	const { t } = useTranslation();
	const [inputText, setInputText] = useState<string>('');
	const [outputText, setOutputText] = useState<string>('');
	const [mode, setMode] = useState<'encode' | 'decode'>('encode');
	const [encodeSpaces, setEncodeSpaces] = useState<boolean>(true);
	const [encodeAll, setEncodeAll] = useState<boolean>(false);

	// URL encoding function
	const encodeUrl = useCallback(() => {
		try {
			if (!inputText.trim()) {
				toast.error(t('urlCodec.noInputText'));
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
			toast.success(t('urlCodec.encodeSuccess'));
		} catch (error) {
			toast.error(
				t('urlCodec.encodeError', {
					error:
						error instanceof Error ? error.message : t('urlCodec.unknownError')
				})
			);
		}
	}, [inputText, encodeSpaces, encodeAll, t]);

	// URL decoding function
	const decodeUrl = useCallback(() => {
		try {
			if (!inputText.trim()) {
				toast.error(t('urlCodec.noInputUrl'));
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
			toast.success(t('urlCodec.decodeSuccess'));
		} catch (error) {
			toast.error(
				t('urlCodec.decodeError', {
					error:
						error instanceof Error
							? error.message
							: t('urlCodec.invalidUrlEncoding')
				})
			);
		}
	}, [inputText, t]);

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
			toast.error(t('urlCodec.noCopyContent'));
			return;
		}

		try {
			void navigator.clipboard.writeText(outputText);
			toast.success(t('urlCodec.copiedToClipboard'));
		} catch {
			toast.error(t('urlCodec.copyFailed'));
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
								setMode(value as 'encode' | 'decode');
								// Reset options when switching modes
								if (value === 'decode') {
									setEncodeAll(false);
								}
							}}
							className='w-full'
						>
							<TabsList className='grid w-full grid-cols-2'>
								<TabsTrigger value='encode'>{t('urlCodec.encode')}</TabsTrigger>
								<TabsTrigger value='decode'>{t('urlCodec.decode')}</TabsTrigger>
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
										{t('urlCodec.encodeSpaces')}
									</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='encodeAll'
										checked={encodeAll}
										onCheckedChange={checked => setEncodeAll(!!checked)}
									/>
									<Label htmlFor='encodeAll' className='cursor-pointer text-sm'>
										{t('urlCodec.encodeAll')}
									</Label>
								</div>
							</div>
						)}

						{/* Input Section */}
						<div className='space-y-2'>
							<Label htmlFor='input' className='text-sm font-medium'>
								{mode === 'encode'
									? t('urlCodec.inputText')
									: t('urlCodec.inputUrlText')}
							</Label>
							<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
								<Textarea
									id='input'
									className='min-h-[150px] w-full resize-y bg-transparent font-mono text-sm'
									value={inputText}
									onChange={e => setInputText(e.target.value)}
									placeholder={
										mode === 'encode'
											? t('urlCodec.inputTextPlaceholder')
											: t('urlCodec.inputUrlPlaceholder')
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
								{mode === 'encode'
									? t('urlCodec.encode')
									: t('urlCodec.decode')}
							</Button>
							<Button
								variant='outline'
								onClick={swapTexts}
								className='flex items-center justify-center gap-2'
								disabled={!outputText}
							>
								<ArrowDownUp className='h-4 w-4' /> {t('urlCodec.swap')}
							</Button>
							<Button
								variant='outline'
								onClick={handleCopy}
								className='flex items-center justify-center gap-2'
								disabled={!outputText}
							>
								<Clipboard className='h-4 w-4' /> {t('urlCodec.copyResult')}
							</Button>
						</div>

						{/* Output Section */}
						<div className='space-y-2'>
							<Label htmlFor='output' className='text-sm font-medium'>
								{mode === 'encode'
									? t('urlCodec.urlEncodeResult')
									: t('urlCodec.urlDecodeResult')}
							</Label>
							<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
								<Textarea
									id='output'
									className='min-h-[150px] w-full resize-y bg-transparent font-mono text-sm'
									value={outputText}
									readOnly
									placeholder={
										mode === 'encode'
											? t('urlCodec.urlEncodePlaceholder')
											: t('urlCodec.urlDecodePlaceholder')
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
