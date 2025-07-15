import type { ReactElement, ReactNode } from 'react';
import Footer from '@/components/Footer.tsx';
import ToolPageHeader from '@/components/ToolPageHeader.tsx';
import { useDocumentTitle } from '@uidotdev/usehooks';
import { useLocation } from '@tanstack/react-router';
import { toolsData } from '@/data/tools.ts';

function ToolPageLayout(props: ToolPageLayoutProps): ReactElement {
	const { children } = props;

	const location = useLocation();
	const toolName =
		toolsData.find(tool => tool.url === location.pathname)?.name ?? '工具';

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
