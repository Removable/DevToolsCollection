import { Link } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ToolPageHeaderProps {
	title: string;
}

const ToolPageHeader = ({ title }: ToolPageHeaderProps) => {
	const { t } = useTranslation();

	return (
		<section className='from-primary/90 bg-gradient-to-r to-gray-700 py-4 text-white'>
			<div className='container mx-auto flex flex-row items-center justify-between px-4 text-center'>
				<div className='w-16'>
					<Link
						to='/'
						className='flex items-center text-white transition-colors hover:text-gray-200'
					>
						<Home size={24} className='mr-1' />
						<span className='font-medium'>{t('common.home')}</span>
					</Link>
				</div>
				<h1 className='mb-2 text-3xl font-bold md:text-3xl'>{title}</h1>
				<div className='w-16' />
			</div>
		</section>
	);
};

export default ToolPageHeader;
