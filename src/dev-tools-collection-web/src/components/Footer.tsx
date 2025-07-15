import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Footer = () => {
	const { t } = useTranslation();
	const currentYear = new Date().getFullYear();

	return (
		<footer className='flex h-20 w-screen flex-row items-center justify-between border-t bg-gray-50 px-4 shadow-sm'>
			<div className='text-center text-gray-500'>
				<span>{t('common.copyright', { year: currentYear })}</span>
			</div>
			<LanguageSwitcher />
		</footer>
	);
};

export default Footer;
