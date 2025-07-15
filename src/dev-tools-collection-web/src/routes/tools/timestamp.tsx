import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Pause, Play } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/tools/timestamp')({
	component: RouteComponent
});

function RouteComponent() {
	const { t } = useTranslation();
	const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [dateInput, setDateInput] = useState<string>(
		new Date().toLocaleString()
	);
	const [timestampInput, setTimestampInput] = useState<string>('');
	const [convertedDate, setConvertedDate] = useState<string>('');
	const [convertedTimestamp, setConvertedTimestamp] = useState<
		number | undefined
	>();
	const [dateFormat, setDateFormat] = useState<string>('default');
	const timerRef = useRef<number | null>(null);

	const secondLevelTimestamp = useMemo(
		() => currentTimestamp.toString().substring(0, 10),
		[currentTimestamp]
	);

	// Update current timestamp every second if not paused
	useEffect(() => {
		if (!isPaused) {
			setCurrentTimestamp(Date.now());
			timerRef.current = window.setInterval(() => {
				setCurrentTimestamp(Date.now());
			}, 1000);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isPaused]);

	const togglePause = () => {
		setIsPaused(!isPaused);
	};

	const copyTimestamp = () => {
		navigator.clipboard.writeText(secondLevelTimestamp);
		toast.success(t('timestampConverter.timestampCopied'));
	};

	const convertDateToTimestamp = () => {
		try {
			const date = new Date(dateInput);
			if (isNaN(date.getTime())) {
				toast.error(t('timestampConverter.invalidDate'));
				return;
			}
			const timestamp = date.getTime();
			setConvertedTimestamp(Math.floor(timestamp / 1000));
			toast.success(t('timestampConverter.dateConversionSuccess'));
		} catch {
			toast.error(t('timestampConverter.invalidDate'));
		}
	};

	const convertTimestampToDate = () => {
		try {
			const timestamp = parseInt(timestampInput);
			if (isNaN(timestamp)) {
				toast.error(t('timestampConverter.invalidTimestamp'));
				return;
			}

			const date = new Date(timestamp);
			let formattedDate: string;

			switch (dateFormat) {
				case 'iso':
					formattedDate = date.toISOString();
					break;
				case 'locale':
					formattedDate = date.toLocaleString();
					break;
				case 'utc':
					formattedDate = date.toUTCString();
					break;
				default:
					formattedDate = date.toString();
					break;
			}

			setConvertedDate(formattedDate);
			toast.success(t('timestampConverter.timestampConversionSuccess'));
		} catch {
			toast.error(t('timestampConverter.invalidTimestamp'));
		}
	};

	return (
		<ToolPageLayout>
			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{/* Current Timestamp Card */}
				<Card>
					<CardContent className='p-6'>
						<h2 className='mb-4 text-xl font-bold'>
							{t('timestampConverter.currentTimestamp')}
						</h2>
						<div className='mb-4 flex items-center'>
							<Input value={secondLevelTimestamp} readOnly className='mr-2' />
							<Button
								variant='outline'
								size='icon'
								onClick={copyTimestamp}
								title={t('timestampConverter.copy')}
							>
								<Copy className='h-4 w-4' />
							</Button>
						</div>
						<Button variant='outline' onClick={togglePause} className='w-full'>
							{isPaused ? (
								<>
									<Play className='mr-2 h-4 w-4' />{' '}
									{t('timestampConverter.continue')}
								</>
							) : (
								<>
									<Pause className='mr-2 h-4 w-4' />{' '}
									{t('timestampConverter.pause')}
								</>
							)}
						</Button>
						<div className='text-muted-foreground mt-3 text-sm'>
							{new Date(currentTimestamp).toLocaleString()}
						</div>
					</CardContent>
				</Card>

				{/* Date to Timestamp Card */}
				<Card>
					<CardContent className='p-6'>
						<h2 className='mb-4 text-xl font-bold'>
							{t('timestampConverter.dateToTimestamp')}
						</h2>
						<div className='mb-4'>
							<label className='mb-1 block text-sm font-medium'>
								{t('timestampConverter.inputDateTime')}
							</label>
							<Input
								type='input'
								value={dateInput}
								onChange={e => setDateInput(e.target.value)}
								className='mb-4'
							/>
							<Button onClick={convertDateToTimestamp} className='w-full'>
								{t('timestampConverter.convert')}
							</Button>
						</div>
						{convertedTimestamp && (
							<div className='border-t pt-2'>
								<label className='mb-1 block text-sm font-medium'>
									{t('timestampConverter.conversionResult')}
								</label>
								<div className='flex items-center'>
									<Input value={convertedTimestamp} readOnly className='mr-2' />
									<Button
										variant='outline'
										size='icon'
										onClick={() => {
											navigator.clipboard.writeText(
												convertedTimestamp.toString()
											);
											toast.success(t('timestampConverter.timestampCopied'));
										}}
										title={t('timestampConverter.copy')}
									>
										<Copy className='h-4 w-4' />
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Timestamp to Date Card */}
				<Card>
					<CardContent className='p-6'>
						<h2 className='mb-4 text-xl font-bold'>
							{t('timestampConverter.timestampToDate')}
						</h2>
						<div className='mb-4'>
							<label className='mb-1 block text-sm font-medium'>
								{t('timestampConverter.inputTimestamp')}
							</label>
							<Input
								type='number'
								placeholder={t('timestampConverter.timestampExample')}
								value={timestampInput}
								onChange={e => setTimestampInput(e.target.value)}
								className='mb-2'
							/>

							<label className='mt-3 mb-1 block text-sm font-medium'>
								{t('timestampConverter.dateFormat')}
							</label>
							<Select value={dateFormat} onValueChange={setDateFormat}>
								<SelectTrigger className='mb-4'>
									<SelectValue
										placeholder={t('timestampConverter.selectDateFormat')}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='default'>
										{t('timestampConverter.defaultFormat')}
									</SelectItem>
									<SelectItem value='iso'>
										{t('timestampConverter.isoFormat')}
									</SelectItem>
									<SelectItem value='locale'>
										{t('timestampConverter.localeFormat')}
									</SelectItem>
									<SelectItem value='utc'>
										{t('timestampConverter.utcFormat')}
									</SelectItem>
								</SelectContent>
							</Select>

							<Button onClick={convertTimestampToDate} className='w-full'>
								{t('timestampConverter.convert')}
							</Button>
						</div>
						{convertedDate && (
							<div className='border-t pt-2'>
								<label className='mb-1 block text-sm font-medium'>
									{t('timestampConverter.conversionResult')}
								</label>
								<div className='flex items-center'>
									<Input value={convertedDate} readOnly className='mr-2' />
									<Button
										variant='outline'
										size='icon'
										onClick={() => {
											navigator.clipboard.writeText(convertedDate);
											toast.success(t('timestampConverter.dateCopied'));
										}}
										title={t('timestampConverter.copy')}
									>
										<Copy className='h-4 w-4' />
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</ToolPageLayout>
	);
}
