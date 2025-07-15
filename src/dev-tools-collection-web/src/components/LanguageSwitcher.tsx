import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useToggle } from '@uidotdev/usehooks';

const LanguageSwitcher = () => {
	const { i18n } = useTranslation();
	const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
	const [on, toggle] = useToggle(i18n.language === 'en');

	useEffect(() => {
		setCurrentLanguage(i18n.language);
	}, [i18n.language]);

	useEffect(() => {
		let newLanguage = 'zh';
		if (on) {
			newLanguage = 'en';
		} else {
			newLanguage = 'zh';
		}

		void i18n.changeLanguage(newLanguage);
	}, [i18n, on]);

	return (
		<Button
			variant='ghost'
			size='sm'
			onClick={() => toggle()}
			className='text-gray-500 hover:text-gray-700'
		>
			{currentLanguage === 'en' ? '中文' : 'English'}
		</Button>
	);
};

export default LanguageSwitcher;
