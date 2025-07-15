import {
	Clock,
	Braces,
	type LucideProps,
	RotateCcwKey,
	Code,
	Link,
	Hash,
	QrCode,
	FileCode,
	Regex,
	Globe
} from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export interface Tool {
	id: string;
	name: string;
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
	>;
	url: string;
	popular?: boolean;
}

export const toolsData: Tool[] = [
	{
		id: 'json-formatter',
		name: 'JSON 格式化',
		icon: Braces,
		url: '/tools/json-formatter',
		popular: true
	},
	{
		id: 'timestamp',
		name: '时间戳转换',
		icon: Clock,
		url: '/tools/timestamp',
		popular: true
	},
	{
		id: 'uuid-generator',
		name: 'UUID/GUID 生成器',
		icon: RotateCcwKey,
		url: '/tools/uuid-generator',
		popular: true
	},
	{
		id: 'base64-codec',
		name: 'Base64 编码/解码',
		icon: Code,
		url: '/tools/base64-codec',
		popular: true
	},
	{
		id: 'url-codec',
		name: 'URL 编码/解码',
		icon: Link,
		url: '/tools/url-codec',
		popular: true
	},
	{
		id: 'qrcode-generator',
		name: '二维码生成器',
		icon: QrCode,
		url: '/tools/qrcode-generator',
		popular: true
	},
	{
		id: 'hash-encoder',
		name: '哈希编码工具',
		icon: Hash,
		url: '/tools/hash-encoder',
		popular: true
	},
	{
		id: 'html-preview',
		name: 'HTML 在线预览',
		icon: FileCode,
		url: '/tools/html-preview',
		popular: true
	},
	{
		id: 'regex-tester',
		name: '正则表达式',
		icon: Regex,
		url: '/tools/regex-tester',
		popular: true
	},
	{
		id: 'ip-info',
		name: 'IP 信息查看',
		icon: Globe,
		url: '/tools/ip-info',
		popular: true
	}
];

export const getPopularTools = (): Tool[] => {
	return toolsData.filter(tool => tool.popular);
};

export const searchTools = (query: string): Tool[] => {
	const lowerQuery = query.toLowerCase();
	return toolsData.filter(tool => tool.name.toLowerCase().includes(lowerQuery));
};
