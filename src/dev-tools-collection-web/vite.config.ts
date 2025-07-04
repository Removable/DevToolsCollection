import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	server: {
		port: 17281
	},
	plugins: [
		TanStackRouterVite({
			target: 'react',
			autoCodeSplitting: true,
			routesDirectory: './src/routes',
			generatedRouteTree: './src/routeTree.gen.ts',
			routeFileIgnorePrefix: '-',
			quoteStyle: 'single'
		}),
		react(),
		tailwindcss()
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
});
