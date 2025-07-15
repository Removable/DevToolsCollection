import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getPopularTools, type Tool, toolsData } from '@/data/tools.ts';
import PageSection from '@/components/PageSection';
import SearchBar from '@/components/SearchBar.tsx';
import ToolCard from '@/components/ToolCard.tsx';
import Footer from '@/components/Footer.tsx';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({
	component: Index
});

function Index() {
	const { t } = useTranslation();
	const [searchResults, setSearchResults] = useState<Tool[]>([]);
	const [, setPopularTools] = useState<Tool[]>([]);

	useEffect(() => {
		// Initialize popular tools data
		const popular = getPopularTools();
		setPopularTools(popular);
	}, []);

	const handleSearchResults = (results: Tool[]) => {
		setSearchResults(results);
	};

	return (
		<div className='flex h-full w-full flex-col'>
			<main className='h-20 w-full flex-grow'>
				{/* Hero Section with reduced height */}
				<PageSection
					title={t('common.toolbox')}
					description={t('common.description')}
					gradient={true}
				>
					<SearchBar onSearchResults={handleSearchResults} />
				</PageSection>

				{/* Tools Content */}
				<section className='container mx-auto px-4 py-8'>
					{/* Search Results */}
					{searchResults.length > 0 ? (
						<div>
							<h2 className='mb-4 text-2xl font-bold'>
								{t('common.searchResults')}
							</h2>
							<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
								{searchResults.map(tool => (
									<ToolCard key={tool.id} tool={tool} />
								))}
							</div>
						</div>
					) : (
						<div>
							<h2 className='mb-4 text-2xl font-bold'>
								{t('common.allTools')}
							</h2>
							<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
								{toolsData.map(tool => (
									<ToolCard key={tool.id} tool={tool} />
								))}
							</div>
						</div>
					)}
				</section>
			</main>

			<Footer />
		</div>
	);
}
