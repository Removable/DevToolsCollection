import type { ReactElement, ReactNode } from 'react';
import Footer from '@/components/Footer.tsx';
import ToolPageHeader from '@/components/ToolPageHeader.tsx';
import { useDocumentTitle } from '@uidotdev/usehooks';
import { useLocation } from '@tanstack/react-router';
import { toolsData } from '@/data/tools.ts';
import { useTranslation } from 'react-i18next';

function ToolPageLayout(props: ToolPageLayoutProps): ReactElement {
	const { children } = props;
	const { t } = useTranslation();

	const location = useLocation();
	const toolId = toolsData.find(tool => tool.url === location.pathname)?.id;
	const toolName = toolId ? t(`tools.${toolId}`) : t('common.tool');

	useDocumentTitle(toolName);

	return (
		<div className='flex min-h-full w-full flex-col'>
			<main className='h-fit min-h-36 w-full flex-grow'>
				<ToolPageHeader title={toolName} />
				<section className='container mx-auto w-full px-4 py-8'>
					{children}
				</section>
			</main>
			<Footer />
		</div>
	);
}

interface ToolPageLayoutProps {
	children: ReactNode;
}

export default ToolPageLayout;
