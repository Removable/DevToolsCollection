import { Card, CardContent } from '@/components/ui/card';
import type { Tool } from '../data/tools';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

interface ToolCardProps {
	tool: Tool;
}

const ToolCard = ({ tool }: ToolCardProps) => {
	const { t } = useTranslation();

	return (
		<Link to={tool.url} className='block'>
			<Card className='hover:border-primary/30 bg-card/50 h-full backdrop-blur-[1px] transition-all duration-200 hover:shadow-md'>
				<CardContent className='p-4'>
					<div className='flex flex-col items-center'>
						<div className='bg-accent/70 border-border/50 mb-3 rounded-lg border p-3 shadow-sm'>
							<tool.icon className='text-primary h-5 w-5' />
						</div>
						<h3 className='text-center font-mono text-base font-medium'>
							{t(`tools.${tool.id}`)}
						</h3>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};

export default ToolCard;
