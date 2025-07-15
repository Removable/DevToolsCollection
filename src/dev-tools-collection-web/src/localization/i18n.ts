import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './en';
import zhTranslation from './zh';

i18n
	// Detect user language
	.use(LanguageDetector)
	// Pass the i18n instance to react-i18next
	.use(initReactI18next)
	// Initialize i18next
	.init({
		resources: {
			en: {
				translation: enTranslation
			},
			zh: {
				translation: zhTranslation
			}
		},
		fallbackLng: 'en', // Default language
		debug: false, // Set to true for development
		supportedLngs: ['en', 'zh'],
		interpolation: {
			escapeValue: false // React already safes from XSS
		},

		detection: {
			order: [
				'navigator',
				'htmlTag',
				'cookie',
				'localStorage',
				'path',
				'subdomain'
			],
			caches: ['localStorage', 'cookie']
		}
	})
	.then(() => {});

export default i18n;
