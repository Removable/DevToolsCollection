import type { ReactNode } from 'react';

interface PageSectionProps {
	title: string;
	description?: string;
	gradient?: boolean;
	children?: ReactNode;
}

const PageSection = ({
	title,
	description,
	gradient = false,
	children
}: PageSectionProps) => {
	return gradient ? (
		<section className='from-primary/90 bg-gradient-to-r to-gray-700 py-8 text-white'>
			<div className='container mx-auto px-4 text-center'>
				<h1 className='mb-2 font-mono text-3xl font-bold tracking-tight md:text-4xl'>
					{title}
				</h1>
				{description && (
					<p className='mx-auto max-w-3xl text-lg opacity-90'>{description}</p>
				)}
				{children && <div className='mt-6'>{children}</div>}
			</div>
		</section>
	) : (
		<section className='container mx-auto px-4 py-8'>
			<h2 className='mb-6 font-mono text-2xl font-bold tracking-tight'>
				{title}
			</h2>
			{description && (
				<p className='text-muted-foreground mb-6 text-lg'>{description}</p>
			)}
			{children && children}
		</section>
	);
};

export default PageSection;
