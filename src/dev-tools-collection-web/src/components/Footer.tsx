const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className='flex h-20 w-full flex-row items-center justify-center border-t bg-gray-50 px-4 shadow-sm'>
			<div className='text-center text-gray-500'>
				<span>&copy;{currentYear} 工具箱. 保留所有权利。</span>
			</div>
		</footer>
	);
};

export default Footer;
