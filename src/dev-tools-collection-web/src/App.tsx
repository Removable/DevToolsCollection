import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import ToolCard from '@/components/ToolCard';
import { getPopularTools, type Tool, toolsData } from '@/data/tools';
import Footer from '@/components/Footer';

const App = () => {
	const [searchResults, setSearchResults] = useState<Tool[]>([]);
	const [, setPopularTools] = useState<Tool[]>([]);

	useEffect(() => {
		// 初始化热门工具数据
		const popular = getPopularTools();
		setPopularTools(popular);
	}, [setPopularTools]);

	const handleSearchResults = (results: Tool[]) => {
		setSearchResults(results);
	};

	return (
		<div className='flex min-h-screen flex-col'>
			<main className='flex-grow'>
				{/* Hero Section with reduced height */}
				<section className='bg-gradient-to-r from-blue-700 to-teal-700 py-10 text-white'>
					<div className='container mx-auto px-4 text-center'>
						<h1 className='mb-3 text-3xl font-bold md:text-4xl'>在线工具箱</h1>
						<SearchBar onSearchResults={handleSearchResults} />
					</div>
				</section>

				{/* Tools Content */}
				<section className='container mx-auto px-4 py-8'>
					{/* Search Results */}
					{searchResults.length > 0 ? (
						<div>
							<h2 className='mb-4 text-2xl font-bold'>搜索结果</h2>
							<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
								{searchResults.map(tool => (
									<ToolCard key={tool.id} tool={tool} />
								))}
							</div>
						</div>
					) : (
						<div>
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
};

export default App;
