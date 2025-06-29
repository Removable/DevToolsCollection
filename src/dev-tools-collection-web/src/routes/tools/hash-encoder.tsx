import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import ToolPageLayout from '@/components/ToolPageLayout.tsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card.tsx';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clipboard, Upload, File, Hash } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

export const Route = createFileRoute('/tools/hash-encoder')({
	component: RouteComponent
});

// MD5 implementation
function md5(input: string): string {
	// Implementation based on the MD5 algorithm
	function cmn(
		q: number,
		a: number,
		b: number,
		x: number,
		s: number,
		t: number
	) {
		a = add32(add32(a, q), add32(x, t));
		return add32((a << s) | (a >>> (32 - s)), b);
	}

	function ff(
		a: number,
		b: number,
		c: number,
		d: number,
		x: number,
		s: number,
		t: number
	) {
		return cmn((b & c) | (~b & d), a, b, x, s, t);
	}

	function gg(
		a: number,
		b: number,
		c: number,
		d: number,
		x: number,
		s: number,
		t: number
	) {
		return cmn((b & d) | (c & ~d), a, b, x, s, t);
	}

	function hh(
		a: number,
		b: number,
		c: number,
		d: number,
		x: number,
		s: number,
		t: number
	) {
		return cmn(b ^ c ^ d, a, b, x, s, t);
	}

	function ii(
		a: number,
		b: number,
		c: number,
		d: number,
		x: number,
		s: number,
		t: number
	) {
		return cmn(c ^ (b | ~d), a, b, x, s, t);
	}

	function md5cycle(x: number[], a: number[]) {
		let a1 = a[0],
			b1 = a[1],
			c1 = a[2],
			d1 = a[3];

		a1 = ff(a1, b1, c1, d1, x[0], 7, -680876936);
		d1 = ff(d1, a1, b1, c1, x[1], 12, -389564586);
		c1 = ff(c1, d1, a1, b1, x[2], 17, 606105819);
		b1 = ff(b1, c1, d1, a1, x[3], 22, -1044525330);
		a1 = ff(a1, b1, c1, d1, x[4], 7, -176418897);
		d1 = ff(d1, a1, b1, c1, x[5], 12, 1200080426);
		c1 = ff(c1, d1, a1, b1, x[6], 17, -1473231341);
		b1 = ff(b1, c1, d1, a1, x[7], 22, -45705983);
		a1 = ff(a1, b1, c1, d1, x[8], 7, 1770035416);
		d1 = ff(d1, a1, b1, c1, x[9], 12, -1958414417);
		c1 = ff(c1, d1, a1, b1, x[10], 17, -42063);
		b1 = ff(b1, c1, d1, a1, x[11], 22, -1990404162);
		a1 = ff(a1, b1, c1, d1, x[12], 7, 1804603682);
		d1 = ff(d1, a1, b1, c1, x[13], 12, -40341101);
		c1 = ff(c1, d1, a1, b1, x[14], 17, -1502002290);
		b1 = ff(b1, c1, d1, a1, x[15], 22, 1236535329);

		a1 = gg(a1, b1, c1, d1, x[1], 5, -165796510);
		d1 = gg(d1, a1, b1, c1, x[6], 9, -1069501632);
		c1 = gg(c1, d1, a1, b1, x[11], 14, 643717713);
		b1 = gg(b1, c1, d1, a1, x[0], 20, -373897302);
		a1 = gg(a1, b1, c1, d1, x[5], 5, -701558691);
		d1 = gg(d1, a1, b1, c1, x[10], 9, 38016083);
		c1 = gg(c1, d1, a1, b1, x[15], 14, -660478335);
		b1 = gg(b1, c1, d1, a1, x[4], 20, -405537848);
		a1 = gg(a1, b1, c1, d1, x[9], 5, 568446438);
		d1 = gg(d1, a1, b1, c1, x[14], 9, -1019803690);
		c1 = gg(c1, d1, a1, b1, x[3], 14, -187363961);
		b1 = gg(b1, c1, d1, a1, x[8], 20, 1163531501);
		a1 = gg(a1, b1, c1, d1, x[13], 5, -1444681467);
		d1 = gg(d1, a1, b1, c1, x[2], 9, -51403784);
		c1 = gg(c1, d1, a1, b1, x[7], 14, 1735328473);
		b1 = gg(b1, c1, d1, a1, x[12], 20, -1926607734);

		a1 = hh(a1, b1, c1, d1, x[5], 4, -378558);
		d1 = hh(d1, a1, b1, c1, x[8], 11, -2022574463);
		c1 = hh(c1, d1, a1, b1, x[11], 16, 1839030562);
		b1 = hh(b1, c1, d1, a1, x[14], 23, -35309556);
		a1 = hh(a1, b1, c1, d1, x[1], 4, -1530992060);
		d1 = hh(d1, a1, b1, c1, x[4], 11, 1272893353);
		c1 = hh(c1, d1, a1, b1, x[7], 16, -155497632);
		b1 = hh(b1, c1, d1, a1, x[10], 23, -1094730640);
		a1 = hh(a1, b1, c1, d1, x[13], 4, 681279174);
		d1 = hh(d1, a1, b1, c1, x[0], 11, -358537222);
		c1 = hh(c1, d1, a1, b1, x[3], 16, -722521979);
		b1 = hh(b1, c1, d1, a1, x[6], 23, 76029189);
		a1 = hh(a1, b1, c1, d1, x[9], 4, -640364487);
		d1 = hh(d1, a1, b1, c1, x[12], 11, -421815835);
		c1 = hh(c1, d1, a1, b1, x[15], 16, 530742520);
		b1 = hh(b1, c1, d1, a1, x[2], 23, -995338651);

		a1 = ii(a1, b1, c1, d1, x[0], 6, -198630844);
		d1 = ii(d1, a1, b1, c1, x[7], 10, 1126891415);
		c1 = ii(c1, d1, a1, b1, x[14], 15, -1416354905);
		b1 = ii(b1, c1, d1, a1, x[5], 21, -57434055);
		a1 = ii(a1, b1, c1, d1, x[12], 6, 1700485571);
		d1 = ii(d1, a1, b1, c1, x[3], 10, -1894986606);
		c1 = ii(c1, d1, a1, b1, x[10], 15, -1051523);
		b1 = ii(b1, c1, d1, a1, x[1], 21, -2054922799);
		a1 = ii(a1, b1, c1, d1, x[8], 6, 1873313359);
		d1 = ii(d1, a1, b1, c1, x[15], 10, -30611744);
		c1 = ii(c1, d1, a1, b1, x[6], 15, -1560198380);
		b1 = ii(b1, c1, d1, a1, x[13], 21, 1309151649);
		a1 = ii(a1, b1, c1, d1, x[4], 6, -145523070);
		d1 = ii(d1, a1, b1, c1, x[11], 10, -1120210379);
		c1 = ii(c1, d1, a1, b1, x[2], 15, 718787259);
		b1 = ii(b1, c1, d1, a1, x[9], 21, -343485551);

		a[0] = add32(a1, a[0]);
		a[1] = add32(b1, a[1]);
		a[2] = add32(c1, a[2]);
		a[3] = add32(d1, a[3]);
	}

	function md5blk_array(a: Uint8Array): number[] {
		const md5blks: number[] = [];
		for (let i = 0; i < 64; i += 4) {
			md5blks[i >> 2] =
				a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
		}
		return md5blks;
	}

	function add32(a: number, b: number): number {
		return (a + b) & 0xffffffff;
	}

	// Convert string to UTF-8 bytes
	const encoder = new TextEncoder();
	const data = encoder.encode(input);

	// Initialize variables
	const state: number[] = [1732584193, -271733879, -1732584194, 271733878];
	let i;

	// Process the message in 64-byte chunks
	for (i = 0; i < data.length; i += 64) {
		const chunk = data.slice(i, i + 64);
		if (chunk.length === 64) {
			md5cycle(md5blk_array(chunk), state);
		} else {
			// Handle the last chunk
			const tail = new Uint8Array(64);
			tail.set(chunk);

			// Append padding
			tail[chunk.length] = 0x80;

			if (chunk.length > 55) {
				md5cycle(md5blk_array(tail), state);
				for (let i = 0; i < 64; i++) {
					tail[i] = 0;
				}
			}

			// Append length (in bits)
			const bits = data.length * 8;
			tail[56] = bits & 0xff;
			tail[57] = (bits >>> 8) & 0xff;
			tail[58] = (bits >>> 16) & 0xff;
			tail[59] = (bits >>> 24) & 0xff;

			md5cycle(md5blk_array(tail), state);
		}
	}

	// Convert the result to hex
	return (
		hex(state[0]) +
		hex(state[1]) +
		hex(state[2]) +
		hex(state[3])
	).toLowerCase();

	function hex(x: number): string {
		const hexChars = '0123456789abcdef';
		let output = '';
		for (let i = 0; i < 4; i++) {
			const value = (x >>> (i * 8)) & 0xff;
			output +=
				hexChars.charAt((value >>> 4) & 0xf) + hexChars.charAt(value & 0xf);
		}
		return output;
	}
}

// Function to calculate file MD5
async function calculateFileMD5(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = event => {
			try {
				if (!event.target?.result) {
					reject(new Error('Failed to read file'));
					return;
				}

				const arrayBuffer = event.target.result as ArrayBuffer;
				const uint8Array = new Uint8Array(arrayBuffer);

				// Convert Uint8Array to string
				let binary = '';
				const chunkSize = 1024;
				for (let i = 0; i < uint8Array.length; i += chunkSize) {
					const chunk = uint8Array.slice(i, i + chunkSize);
					for (let j = 0; j < chunk.length; j++) {
						binary += String.fromCharCode(chunk[j]);
					}
				}

				const result = md5(binary);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		};

		reader.onerror = () => {
			reject(new Error('Error reading file'));
		};

		reader.readAsArrayBuffer(file);
	});
}

function RouteComponent() {
	const [inputText, setInputText] = useState<string>('');
	const [outputText, setOutputText] = useState<string>('');
	const [mode, setMode] = useState<'text' | 'file'>('text');
	const [algorithm, setAlgorithm] = useState<string>('md5');
	const [secretKey, setSecretKey] = useState<string>('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileName, setFileName] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Hash algorithms
	const hashAlgorithms = [
		{ value: 'md5', label: 'MD5' },
		{ value: 'sha1', label: 'SHA-1' },
		{ value: 'sha256', label: 'SHA-256' },
		{ value: 'sha384', label: 'SHA-384' },
		{ value: 'sha512', label: 'SHA-512' },
		{ value: 'hmac-md5', label: 'HMAC-MD5' },
		{ value: 'hmac-sha1', label: 'HMAC-SHA1' },
		{ value: 'hmac-sha256', label: 'HMAC-SHA256' },
		{ value: 'hmac-sha384', label: 'HMAC-SHA384' },
		{ value: 'hmac-sha512', label: 'HMAC-SHA512' }
	];

	// Convert ArrayBuffer to hex string
	const bufferToHex = (buffer: ArrayBuffer): string => {
		return Array.from(new Uint8Array(buffer))
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');
	};

	// Check if the algorithm is an HMAC variant
	const isHmacAlgorithm = (algo: string): boolean => {
		return algo.startsWith('hmac-');
	};

	// Get the base algorithm from HMAC algorithm
	const getBaseAlgorithm = (algo: string): string => {
		return algo.replace('hmac-', '');
	};

	// Format algorithm name for Web Crypto API
	const formatAlgorithmForCrypto = (algo: string): string => {
		switch (algo) {
			case 'sha1':
				return 'SHA-1';
			case 'sha256':
				return 'SHA-256';
			case 'sha384':
				return 'SHA-384';
			case 'sha512':
				return 'SHA-512';
			default:
				return algo.toUpperCase();
		}
	};

	// HMAC-MD5 implementation
	const hmacMd5 = (message: string, key: string): string => {
		// Convert key to bytes
		const keyEncoder = new TextEncoder();
		let keyBytes = keyEncoder.encode(key);

		// If key is longer than 64 bytes, hash it
		if (keyBytes.length > 64) {
			const keyString = Array.from(keyBytes)
				.map(b => String.fromCharCode(b))
				.join('');
			const hashedKey = md5(keyString);
			keyBytes = new TextEncoder().encode(hashedKey);
		}

		// If key is shorter than 64 bytes, pad it
		if (keyBytes.length < 64) {
			const paddedKey = new Uint8Array(64);
			paddedKey.set(keyBytes);
			keyBytes = paddedKey;
		}

		// Create inner and outer padding
		const innerPadding = new Uint8Array(64);
		const outerPadding = new Uint8Array(64);

		for (let i = 0; i < 64; i++) {
			innerPadding[i] = keyBytes[i] ^ 0x36; // 0x36 = '6'
			outerPadding[i] = keyBytes[i] ^ 0x5c; // 0x5c = '\'
		}

		// Convert to strings
		const innerPaddingStr = Array.from(innerPadding)
			.map(b => String.fromCharCode(b))
			.join('');
		const outerPaddingStr = Array.from(outerPadding)
			.map(b => String.fromCharCode(b))
			.join('');

		// Inner hash: MD5(innerPadding + message)
		const innerHash = md5(innerPaddingStr + message);

		// Outer hash: MD5(outerPadding + innerHash)
		// Convert innerHash hex string to bytes
		const innerHashBytes = [];
		for (let i = 0; i < innerHash.length; i += 2) {
			innerHashBytes.push(parseInt(innerHash.substr(i, 2), 16));
		}
		const innerHashStr = innerHashBytes
			.map(b => String.fromCharCode(b))
			.join('');

		// Final hash
		return md5(outerPaddingStr + innerHashStr);
	};

	// Hash text using Web Crypto API or custom MD5/HMAC implementations
	const hashText = useCallback(async () => {
		try {
			if (!inputText.trim()) {
				toast.error('请先输入需要哈希的文本');
				return;
			}

			// Check if secret key is provided for HMAC algorithms
			if (isHmacAlgorithm(algorithm) && !secretKey.trim()) {
				toast.error('使用HMAC算法时必须提供密钥');
				return;
			}

			let hashHex: string;

			// Handle HMAC algorithms
			if (isHmacAlgorithm(algorithm)) {
				const baseAlgo = getBaseAlgorithm(algorithm);

				// Use custom HMAC-MD5 implementation
				if (baseAlgo === 'md5') {
					hashHex = hmacMd5(inputText, secretKey);
				} else {
					// Use Web Crypto API for other HMAC algorithms
					const encoder = new TextEncoder();
					const data = encoder.encode(inputText);
					const keyData = encoder.encode(secretKey);

					// Import the key
					const cryptoKey = await crypto.subtle.importKey(
						'raw',
						keyData,
						{
							name: 'HMAC',
							hash: { name: formatAlgorithmForCrypto(baseAlgo) }
						},
						false,
						['sign']
					);

					// Sign the data
					const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);

					// Convert to hex string
					hashHex = bufferToHex(signature);
				}
			} else {
				// Handle regular hash algorithms
				if (algorithm === 'md5') {
					hashHex = md5(inputText);
				} else {
					// Use Web Crypto API for other algorithms
					const encoder = new TextEncoder();
					const data = encoder.encode(inputText);

					// Hash the data
					const hashBuffer = await crypto.subtle.digest(
						formatAlgorithmForCrypto(algorithm),
						data
					);

					// Convert to hex string
					hashHex = bufferToHex(hashBuffer);
				}
			}

			setOutputText(hashHex);
			toast.success('哈希计算成功');
		} catch (error) {
			toast.error(
				'哈希计算失败: ' + (error instanceof Error ? error.message : '未知错误')
			);
		}
	}, [inputText, algorithm, secretKey]);

	// Handle file selection
	const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			setSelectedFile(file);
			setFileName(file.name);
			toast.success(`已选择文件: ${file.name}`);
		}
	}, []);

	// Hash file
	const hashFile = useCallback(async () => {
		if (!selectedFile) {
			toast.error('请先选择文件');
			return;
		}

		// Check file size (limit to 10MB)
		if (selectedFile.size > 10 * 1024 * 1024) {
			toast.error('文件大小不能超过10MB');
			return;
		}

		// Check if secret key is provided for HMAC algorithms
		if (isHmacAlgorithm(algorithm) && !secretKey.trim()) {
			toast.error('使用HMAC算法时必须提供密钥');
			return;
		}

		try {
			let hashHex: string;

			// Handle HMAC algorithms
			if (isHmacAlgorithm(algorithm)) {
				const baseAlgo = getBaseAlgorithm(algorithm);
				const arrayBuffer = await selectedFile.arrayBuffer();

				if (baseAlgo === 'md5') {
					// For HMAC-MD5, we need to convert the file to a string
					const uint8Array = new Uint8Array(arrayBuffer);
					let binary = '';
					const chunkSize = 1024;
					for (let i = 0; i < uint8Array.length; i += chunkSize) {
						const chunk = uint8Array.slice(i, i + chunkSize);
						for (let j = 0; j < chunk.length; j++) {
							binary += String.fromCharCode(chunk[j]);
						}
					}

					// Use custom HMAC-MD5 implementation
					hashHex = hmacMd5(binary, secretKey);
				} else {
					// Use Web Crypto API for other HMAC algorithms
					const keyData = new TextEncoder().encode(secretKey);

					// Import the key
					const cryptoKey = await crypto.subtle.importKey(
						'raw',
						keyData,
						{
							name: 'HMAC',
							hash: { name: formatAlgorithmForCrypto(baseAlgo) }
						},
						false,
						['sign']
					);

					// Sign the data
					const signature = await crypto.subtle.sign(
						'HMAC',
						cryptoKey,
						arrayBuffer
					);

					// Convert to hex string
					hashHex = bufferToHex(signature);
				}
			} else {
				// Handle regular hash algorithms
				if (algorithm === 'md5') {
					hashHex = await calculateFileMD5(selectedFile);
				} else {
					// Read file as ArrayBuffer
					const arrayBuffer = await selectedFile.arrayBuffer();

					// Hash the file data using Web Crypto API
					const hashBuffer = await crypto.subtle.digest(
						formatAlgorithmForCrypto(algorithm),
						arrayBuffer
					);

					// Convert to hex string
					hashHex = bufferToHex(hashBuffer);
				}
			}

			setOutputText(hashHex);
			toast.success('文件哈希计算成功');
		} catch (error) {
			toast.error(
				'哈希计算失败: ' + (error instanceof Error ? error.message : '未知错误')
			);
		}
	}, [selectedFile, algorithm, secretKey]);

	// Process function based on the current mode
	const processData = useCallback(() => {
		if (mode === 'text') {
			void hashText();
		} else if (mode === 'file') {
			void hashFile();
		}
	}, [mode, hashText, hashFile]);

	// Copy output to clipboard
	const handleCopy = useCallback(() => {
		if (!outputText) {
			toast.error('没有可复制的内容');
			return;
		}

		try {
			void navigator.clipboard.writeText(outputText);
			toast.success('已复制到剪贴板');
		} catch {
			toast.error('复制到剪贴板失败');
		}
	}, [outputText]);

	return (
		<ToolPageLayout>
			<div className='container mx-auto w-full max-w-4xl px-4 py-8'>
				<Card className='bg-card/50 border-border/40 w-full border p-8 shadow-lg backdrop-blur-sm'>
					<div className='mb-8 space-y-6'>
						{/* Mode Selection Tabs */}
						<Tabs
							defaultValue='text'
							value={mode}
							onValueChange={value => {
								setMode(value as 'text' | 'file');
								// Clear output when switching modes
								setOutputText('');
								// Clear file selection when switching to text mode
								if (value === 'text') {
									setSelectedFile(null);
									setFileName('');
								}
								// Clear input text when switching to file mode
								if (value === 'file') {
									setInputText('');
								}
							}}
							className='w-full'
						>
							<TabsList className='grid w-full grid-cols-2'>
								<TabsTrigger value='text'>文本哈希</TabsTrigger>
								<TabsTrigger value='file'>文件哈希</TabsTrigger>
							</TabsList>
						</Tabs>

						{/* Algorithm Selection */}
						<div className='space-y-2'>
							<Label htmlFor='algorithm' className='text-sm font-medium'>
								选择哈希算法
							</Label>
							<Select value={algorithm} onValueChange={setAlgorithm}>
								<SelectTrigger id='algorithm' className='w-full'>
									<SelectValue placeholder='选择哈希算法' />
								</SelectTrigger>
								<SelectContent>
									{hashAlgorithms.map(algo => (
										<SelectItem key={algo.value} value={algo.value}>
											{algo.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Secret Key Input - Only visible for HMAC algorithms */}
						{isHmacAlgorithm(algorithm) && (
							<div className='space-y-2'>
								<Label htmlFor='secretKey' className='text-sm font-medium'>
									HMAC 密钥
								</Label>
								<Input
									id='secretKey'
									type='text'
									value={secretKey}
									onChange={e => setSecretKey(e.target.value)}
									placeholder='输入HMAC密钥...'
									className='font-mono'
								/>
							</div>
						)}

						{/* Text Input Section */}
						{mode === 'text' && (
							<div className='space-y-2'>
								<Label htmlFor='input' className='text-sm font-medium'>
									输入文本
								</Label>
								<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
									<Textarea
										id='input'
										className='min-h-[150px] w-full resize-y bg-transparent font-mono text-sm'
										value={inputText}
										onChange={e => setInputText(e.target.value)}
										placeholder='输入需要哈希的文本...'
									/>
								</div>
							</div>
						)}

						{/* File Upload Section */}
						{mode === 'file' && (
							<div className='space-y-2'>
								<Label className='text-sm font-medium'>上传文件进行哈希</Label>
								<div className='flex flex-col space-y-2'>
									<div className='flex items-center gap-2'>
										<Input
											ref={fileInputRef}
											type='file'
											onChange={handleFileChange}
											className='hidden'
											id='file-upload'
										/>
										<Button
											type='button'
											variant='outline'
											onClick={() => fileInputRef.current?.click()}
											className='flex items-center gap-2'
										>
											<Upload className='h-4 w-4' /> 选择文件
										</Button>
									</div>
									{fileName && (
										<div className='text-muted-foreground flex items-center gap-2 text-sm'>
											<File className='h-4 w-4' /> {fileName}
										</div>
									)}
									<p className='text-muted-foreground text-xs'>
										支持所有文件类型，最大文件大小: 10MB
									</p>
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className='flex flex-row justify-between gap-4'>
							<Button
								onClick={processData}
								className='flex items-center justify-center gap-2'
							>
								<Hash className='h-4 w-4' />
								{mode === 'text' ? '计算哈希' : '计算文件哈希'}
							</Button>
							<Button
								variant='outline'
								onClick={handleCopy}
								className='flex items-center justify-center gap-2'
								disabled={!outputText}
							>
								<Clipboard className='h-4 w-4' /> 复制结果
							</Button>
						</div>

						{/* Output Section */}
						<div className='space-y-2'>
							<Label htmlFor='output' className='text-sm font-medium'>
								哈希结果
							</Label>
							<div className='bg-background/80 rounded-md border p-1 shadow-sm'>
								<Textarea
									id='output'
									className='min-h-[100px] w-full resize-y bg-transparent font-mono text-sm'
									value={outputText}
									readOnly
									placeholder='哈希计算结果...'
								/>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</ToolPageLayout>
	);
}
