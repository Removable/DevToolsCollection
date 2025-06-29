import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Clipboard, RotateCcw, CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/tools/uuid-generator')({
	component: RouteComponent
});

function RouteComponent() {
	const [count, setCount] = useState<number>(1);
	const [uppercase, setUppercase] = useState<boolean>(false);
	const [commaSeparated, setCommaSeparated] = useState<boolean>(false);
	const [useHyphens, setUseHyphens] = useState<boolean>(true);
	const [useQuotes, setUseQuotes] = useState<boolean>(false);
	const [uuids, setUuids] = useState<string[]>([]);
	const [alertInfo, setAlertInfo] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);

	// Generate UUIDs
	const generateUuids = useCallback(() => {
		const newUuids: string[] = [];
		for (let i = 0; i < count; i++) {
			let uuid = crypto.randomUUID().toString();
			if (!useHyphens) {
				uuid = uuid.replace(/-/g, '');
			}
			if (uppercase) {
				uuid = uuid.toUpperCase();
			}
			newUuids.push(uuid);
		}
		setUuids(newUuids);
		setAlertInfo({
			type: 'success',
			message: `已生成 ${count} 个 UUID`
		});
	}, [count, uppercase, useHyphens]);

	// Format UUIDs as text
	const getFormattedUuids = useCallback(() => {
		if (uuids.length === 0) return '';
		const formattedUuids = useQuotes ? uuids.map(uuid => `"${uuid}"`) : uuids;
		return formattedUuids.join(commaSeparated ? ',\n' : '\n');
	}, [uuids, commaSeparated, useQuotes]);

	// Copy UUIDs to clipboard
	const handleCopy = useCallback(() => {
		if (uuids.length === 0) {
			setAlertInfo({
				type: 'error',
				message: '没有可复制的 UUID'
			});
			return;
		}

		try {
			void navigator.clipboard.writeText(getFormattedUuids());
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
	}, [uuids, getFormattedUuids]);

	return (
		<ToolPageLayout>
			<div className='container mx-auto w-full max-w-4xl px-4 py-8'>
				<Card className='bg-card/50 border-border/40 w-full border p-8 shadow-lg backdrop-blur-sm'>
					<div className='mb-8 space-y-6'>
						{/* Controls Section */}
						<div className='flex flex-row items-start justify-start gap-16'>
							{/*<div className='grid gap-6 md:grid-cols-3'>*/}
							{/* Count Input */}
							<div className='flex flex-col space-y-2'>
								<Label htmlFor='count' className='text-sm font-medium'>
									生成数量
								</Label>
								<Input
									id='count'
									type='number'
									min='1'
									max='100'
									value={count}
									onChange={e => setCount(parseInt(e.target.value) || 1)}
									className='h-10 w-20'
								/>
							</div>

							{/* Options Section */}
							<div className='flex flex-col space-y-4 md:space-y-4'>
								{/* Use Hyphens Option */}
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='hyphens'
										checked={useHyphens}
										onCheckedChange={checked => setUseHyphens(!!checked)}
									/>
									<Label htmlFor='hyphens' className='cursor-pointer text-sm'>
										连字符|-
									</Label>
								</div>

								{/* Uppercase Option */}
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='uppercase'
										checked={uppercase}
										onCheckedChange={checked => setUppercase(!!checked)}
									/>
									<Label htmlFor='uppercase' className='cursor-pointer text-sm'>
										使用大写
									</Label>
								</div>

								{/* Comma Separated Option */}
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='comma'
										checked={commaSeparated}
										onCheckedChange={checked => setCommaSeparated(!!checked)}
									/>
									<Label htmlFor='comma' className='cursor-pointer text-sm'>
										逗号分隔|,
									</Label>
								</div>

								{/* Use Quotes Option */}
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='quotes'
										checked={useQuotes}
										onCheckedChange={checked => setUseQuotes(!!checked)}
									/>
									<Label htmlFor='quotes' className='cursor-pointer text-sm'>
										引号|&quot;&quot;
									</Label>
								</div>
							</div>

							{/* Action Buttons */}
							<div className='flex flex-col justify-start space-y-4 space-x-20'>
								<Button
									onClick={generateUuids}
									className='flex w-full items-center justify-center gap-2'
								>
									<RotateCcw className='h-4 w-4' /> 生成 UUID
								</Button>
								<Button
									variant='outline'
									onClick={handleCopy}
									className='flex w-full items-center justify-center gap-2'
								>
									<Clipboard className='h-4 w-4' /> 复制
								</Button>
							</div>
						</div>

						{/* Alert Message */}
						{alertInfo && (
							<div
								className={`flex items-center rounded-md border p-4 ${
									alertInfo.type === 'success'
										? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
										: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
								}`}
							>
								{alertInfo.type === 'success' && (
									<CheckCircle className='mr-3 h-5 w-5 text-green-500 dark:text-green-400' />
								)}
								<p
									className={`text-sm font-medium ${
										alertInfo.type === 'success'
											? 'text-green-800 dark:text-green-300'
											: 'text-red-800 dark:text-red-300'
									}`}
								>
									{alertInfo.message}
								</p>
							</div>
						)}

						{/* UUID Output */}
						<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
							<Textarea
								className='min-h-[350px] w-full resize-y bg-transparent font-mono text-sm'
								value={getFormattedUuids()}
								readOnly
								placeholder='点击"生成 UUID"按钮生成 UUID...'
							/>
						</div>
					</div>
				</Card>
			</div>
		</ToolPageLayout>
	);
}
