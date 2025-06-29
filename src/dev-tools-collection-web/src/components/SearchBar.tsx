import { useEffect, useState } from 'react';
import { searchTools, type Tool } from '@/data/tools.ts';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';

interface SearchBarProps {
	onSearchResults: (results: Tool[]) => void;
}

const SearchBar = ({ onSearchResults }: SearchBarProps) => {
	const [query, setQuery] = useState<string>('');

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (query) {
				const results = searchTools(query);
				onSearchResults(results);
			} else {
				onSearchResults([]);
			}
		}, 300);

		return () => clearTimeout(delayDebounce);
	}, [query, onSearchResults]);

	return (
		<div className='relative mx-auto w-full max-w-3xl'>
			<div className='relative'>
				<Search
					className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform'
					size={20}
				/>
				<Input
					type='text'
					placeholder='搜索工具，如：JSON 格式化、时间戳转换...'
					className='bg-background/80 w-full rounded-lg border py-6 pr-4 pl-10 text-black shadow-sm backdrop-blur-sm focus-visible:ring-white'
					value={query}
					onChange={e => setQuery(e.target.value)}
				/>
			</div>
		</div>
	);
};

export default SearchBar;
