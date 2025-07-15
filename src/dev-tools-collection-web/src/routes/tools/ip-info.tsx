import { createFileRoute } from '@tanstack/react-router';
import { type ChangeEvent, type KeyboardEvent, useState } from 'react';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label.tsx';
import {
	AlertTriangle,
	Globe,
	Info,
	MapPin,
	Search,
	Shield
} from 'lucide-react';
import useFetchIpInfoPage, { type IPInfo } from '@/hooks/useGetIpInfo.ts';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/tools/ip-info')({
	component: IPInfoViewer
});

function IPInfoViewer() {
	const { t } = useTranslation();
	const [ipAddress, setIpAddress] = useState('');
	const { loading: isLoading, getIpInfo } = useFetchIpInfoPage();

	// This is just for UI demonstration, in a real implementation this would come from an API
	const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setIpAddress(e.target.value);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && ipAddress) {
			handleSearch();
		}
	};

	const handleSearch = async (getMyIp?: boolean) => {
		if (!ipAddress && !getMyIp) return;

		const ipInfo = await getIpInfo(getMyIp ? undefined : ipAddress);

		setIpInfo(ipInfo);
	};

	return (
		<ToolPageLayout>
			<div className='container mx-auto w-full px-4 py-8'>
				<Card className='bg-card/50 border-border/40 w-full border p-6 shadow-lg backdrop-blur-sm'>
					<div className='mb-6'>
						<h2 className='mb-2 text-xl font-semibold'>{t('ipInfo.title')}</h2>
						<p className='text-muted-foreground'>{t('ipInfo.description')}</p>
					</div>

					<div className='mb-6 flex gap-3'>
						<div className='flex-grow'>
							<Label htmlFor='ip-input' className='mb-2 block'>
								{t('ipInfo.inputIp')}
							</Label>
							<Input
								id='ip-input'
								placeholder={t('ipInfo.ipPlaceholder')}
								value={ipAddress}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								className='w-full'
							/>
						</div>
						<div className='flex items-end gap-2'>
							<Button
								onClick={() => handleSearch()}
								disabled={isLoading || !ipAddress}
								className='flex items-center gap-2'
							>
								<Search className='h-4 w-4' />
								{isLoading ? t('ipInfo.searching') : t('ipInfo.search')}
							</Button>
							<Button
								onClick={() => handleSearch(true)}
								disabled={isLoading}
								className='flex items-center gap-2'
								variant='outline'
							>
								<Globe className='h-4 w-4' />
								{isLoading ? t('ipInfo.searching') : t('ipInfo.searchMyIp')}
							</Button>
						</div>
					</div>

					{ipInfo && (
						<div className='bg-background rounded-md border p-4'>
							<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
								{/* 基本信息 */}
								<div className='space-y-4'>
									<h3 className='flex items-center gap-2 text-lg font-medium'>
										<Globe className='text-primary h-5 w-5' />
										基本信息
									</h3>

									<div className='grid grid-cols-1 gap-3'>
										<InfoItem label='IP 地址' value={ipInfo.ip} />
										<InfoItem label='ASN' value={ipInfo.asn} />
										<InfoItem label='IP 范围' value={ipInfo.range} />
										<InfoItem label='公司' value={ipInfo.company} />
										<InfoItem label='ASN 类型' value={ipInfo.asnType} />
										<InfoItem
											label='滥用联系方式'
											value={ipInfo.abuseContact}
										/>
									</div>
								</div>

								{/* 位置信息 */}
								<div className='space-y-4'>
									<h3 className='flex items-center gap-2 text-lg font-medium'>
										<MapPin className='text-primary h-5 w-5' />
										位置信息
									</h3>

									<div className='grid grid-cols-1 gap-3'>
										<InfoItem label='城市' value={ipInfo.location.city} />
										<InfoItem label='州/省' value={ipInfo.location.state} />
										<InfoItem label='国家' value={ipInfo.location.country} />
										<InfoItem
											label='坐标'
											value={ipInfo.location.coordinates}
										/>
										<InfoItem label='本地时间' value={ipInfo.time.localTime} />
										<InfoItem label='时区' value={ipInfo.time.timezone} />
									</div>
								</div>

								{/* 隐私和网络信息 */}
								<div className='space-y-4 md:col-span-2'>
									<h3 className='flex items-center gap-2 text-lg font-medium'>
										<Shield className='text-primary h-5 w-5' />
										隐私和网络信息
									</h3>

									<div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
										<PrivacyItem
											label='私密IP'
											value={ipInfo.privacy}
											description='此 IP 是否使用 VPN 或其他方法隐藏'
										/>
										<PrivacyItem
											label='Anycast'
											value={ipInfo.anycast}
											description='任播(Anycast)地址是多个系统共享的地址'
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</Card>
			</div>
		</ToolPageLayout>
	);
}

// Helper components
const InfoItem = ({
	label,
	value,
	description
}: {
	label: string;
	value: string;
	description?: string;
}) => (
	<div className='flex flex-col'>
		<div className='flex justify-between'>
			<span className='text-muted-foreground text-sm'>{label}:</span>
			<span className='text-sm font-medium'>{value}</span>
		</div>
		{description && (
			<span className='text-muted-foreground mt-1 text-xs'>{description}</span>
		)}
	</div>
);

const PrivacyItem = ({
	label,
	value,
	description
}: {
	label: string;
	value: boolean;
	description: string;
}) => (
	<div className='bg-background/50 flex flex-col items-center justify-center rounded-md border p-3'>
		<div className='mb-2'>
			{!value ? (
				<AlertTriangle className='h-5 w-5 text-yellow-500' />
			) : (
				<Info className='h-5 w-5 text-green-500' />
			)}
		</div>
		<span className='text-sm font-medium'>{label}</span>
		<span className='text-muted-foreground mt-1 text-center text-xs'>
			{value ? '是' : '否'}
		</span>
		<span className='text-muted-foreground mt-1 hidden text-center text-xs md:block'>
			{description}
		</span>
	</div>
);
