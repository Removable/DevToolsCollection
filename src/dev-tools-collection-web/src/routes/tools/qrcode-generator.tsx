import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback, useEffect } from 'react';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { useDebounce } from '@uidotdev/usehooks';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/tools/qrcode-generator')({
	component: RouteComponent
});

function RouteComponent() {
	const { t } = useTranslation();
	const [text, setText] = useState<string>('');
	const [size, setSize] = useState<number>(200);
	const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<
		'L' | 'M' | 'Q' | 'H'
	>('M');
	const [qrColor, setQrColor] = useState<string>('#000000');
	const [bgColor, setBgColor] = useState<string>('#FFFFFF');
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

	// Generate QR code
	const generateQrCode = useCallback(
		async (str: string) => {
			if (!str) {
				setQrCodeDataUrl('');
				return;
			}

			try {
				// Configure QR code options
				const options = {
					errorCorrectionLevel: errorCorrectionLevel,
					width: size,
					margin: 1,
					color: {
						dark: qrColor,
						light: bgColor
					}
				};

				// Generate QR code as data URL
				const dataUrl = await QRCode.toDataURL(str, options);
				setQrCodeDataUrl(dataUrl);
				toast.success(t('qrcodeGenerator.generateSuccess'));
			} catch (error) {
				console.error('QR code generation error:', error);
				toast.error(t('qrcodeGenerator.generateError'));
			}
		},
		[size, errorCorrectionLevel, qrColor, bgColor, t]
	);

	const debouncedText = useDebounce(text, 500);

	// Effect to generate QR code when parameters change
	useEffect(() => {
		if (text) {
			void generateQrCode(debouncedText);
		}
	}, [debouncedText, generateQrCode, text]);

	// Download QR code image
	const handleDownload = useCallback(() => {
		if (!qrCodeDataUrl) {
			toast.error(t('qrcodeGenerator.noQrToDownload'));
			return;
		}

		const link = document.createElement('a');
		link.href = qrCodeDataUrl;
		link.download = 'qrcode.png';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success(t('qrcodeGenerator.downloadSuccess'));
	}, [qrCodeDataUrl, t]);

	return (
		<ToolPageLayout>
			<div className='container mx-auto w-full max-w-4xl px-4 py-8'>
				<Card className='bg-card/50 border-border/40 w-full border p-8 shadow-lg backdrop-blur-sm'>
					<div className='mb-8 space-y-6'>
						{/* Input Section */}
						<div className='flex flex-col space-y-2'>
							<Label htmlFor='text' className='text-sm font-medium'>
								{t('qrcodeGenerator.content')}
							</Label>
							<Textarea
								id='text'
								value={text}
								onChange={e => setText(e.target.value)}
								placeholder={t('qrcodeGenerator.contentPlaceholder')}
								className='min-h-[100px] resize-y'
							/>
						</div>

						{/* Controls Section */}
						<div className='grid gap-6 md:grid-cols-2'>
							{/* Left Column - QR Code Settings */}
							<div className='space-y-4'>
								{/* Error Correction Level */}
								<div className='flex flex-col space-y-2'>
									<Label htmlFor='errorLevel' className='text-sm font-medium'>
										{t('qrcodeGenerator.errorCorrectionLevel')}
									</Label>
									<Select
										value={errorCorrectionLevel}
										onValueChange={value =>
											setErrorCorrectionLevel(value as 'L' | 'M' | 'Q' | 'H')
										}
									>
										<SelectTrigger id='errorLevel' className='w-full'>
											<SelectValue
												placeholder={t('qrcodeGenerator.selectErrorLevel')}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='L'>
												{t('qrcodeGenerator.errorLevelL')}
											</SelectItem>
											<SelectItem value='M'>
												{t('qrcodeGenerator.errorLevelM')}
											</SelectItem>
											<SelectItem value='Q'>
												{t('qrcodeGenerator.errorLevelQ')}
											</SelectItem>
											<SelectItem value='H'>
												{t('qrcodeGenerator.errorLevelH')}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Size */}
								<div className='flex flex-col space-y-2'>
									<Label htmlFor='size' className='text-sm font-medium'>
										{t('qrcodeGenerator.size', { size })}
									</Label>
									<Input
										id='size'
										type='number'
										min='100'
										max='500'
										step='10'
										value={size}
										onChange={e => setSize(parseInt(e.target.value) || 200)}
										className='h-10'
									/>
								</div>

								{/* Colors */}
								<div className='grid grid-cols-2 gap-4'>
									<div className='flex flex-col space-y-2'>
										<Label htmlFor='qrColor' className='text-sm font-medium'>
											{t('qrcodeGenerator.qrColor')}
										</Label>
										<div className='flex items-center space-x-2'>
											<Input
												id='qrColor'
												type='color'
												value={qrColor}
												onChange={e => setQrColor(e.target.value)}
												className='h-10 w-10 p-1'
											/>
											<Input
												type='text'
												value={qrColor}
												onChange={e => setQrColor(e.target.value)}
												className='h-10'
											/>
										</div>
									</div>
									<div className='flex flex-col space-y-2'>
										<Label htmlFor='bgColor' className='text-sm font-medium'>
											{t('qrcodeGenerator.backgroundColor')}
										</Label>
										<div className='flex items-center space-x-2'>
											<Input
												id='bgColor'
												type='color'
												value={bgColor}
												onChange={e => setBgColor(e.target.value)}
												className='h-10 w-10 p-1'
											/>
											<Input
												type='text'
												value={bgColor}
												onChange={e => setBgColor(e.target.value)}
												className='h-10'
											/>
										</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className='flex space-x-4 pt-4'>
									<Button
										onClick={() => generateQrCode(text)}
										className='flex items-center justify-center gap-2'
									>
										{t('qrcodeGenerator.generate')}
									</Button>
									<Button
										variant='outline'
										onClick={handleDownload}
										className='flex items-center justify-center gap-2'
									>
										{t('qrcodeGenerator.download')}
									</Button>
								</div>
							</div>

							{/* Right Column - QR Code Display */}
							<div className='flex flex-col items-center justify-center space-y-4'>
								{qrCodeDataUrl ? (
									<div className='flex flex-col items-center space-y-4'>
										<div className='bg-background rounded-md border p-4 shadow-sm'>
											<img
												src={qrCodeDataUrl}
												alt='Generated QR Code'
												className='h-auto max-w-full'
											/>
										</div>
									</div>
								) : (
									<div className='flex h-[200px] w-[200px] items-center justify-center rounded-md border bg-gray-100 text-center text-gray-500'>
										{t('qrcodeGenerator.enterContent')}
									</div>
								)}
							</div>
						</div>
					</div>
				</Card>
			</div>
		</ToolPageLayout>
	);
}
