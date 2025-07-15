import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getPopularTools, type Tool, toolsData } from '@/data/tools.ts';
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
				<section className='from-primary/90 bg-gradient-to-r to-gray-700 py-8 text-white'>
					<div className='container mx-auto px-4 text-center'>
						<div className='mb-2 flex flex-row items-end justify-center gap-5'>
							<img src='/icon.svg' className='size-12' alt='icon-image' />
							<h1 className='font-mono text-3xl font-bold tracking-tight md:text-4xl'>
								{t('common.toolbox')}
							</h1>
						</div>
						<div className='mt-6'>
							<SearchBar onSearchResults={handleSearchResults} />
						</div>
					</div>
				</section>

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
