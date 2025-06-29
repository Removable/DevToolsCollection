import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import tsParser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(
	{ ignores: ['dist', '**/routeTree.gen.ts', 'src/components/ui/*.tsx'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{js,jsx,ts,tsx}'],
		...pluginReact.configs.flat.recommended,
		languageOptions: {
			...pluginReact.configs.flat.recommended.languageOptions,
			ecmaVersion: 2021,
			globals: globals.browser,
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		plugins: {
			react: pluginReact,
			'react-hooks': reactHooks,
			'jsx-a11y': jsxA11y,
			'unused-imports': unusedImports,
			import: importPlugin,
			'react-refresh': reactRefresh,
			prettier: prettierPlugin
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			...pluginReact.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true }
			],
			quotes: ['error', 'single', { avoidEscape: true }],
			'react/react-in-jsx-scope': 'off'
		}
	}
);
