import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			}
		}
	},
	{
		files: ['**/*.ts'],
		plugins: { '@typescript-eslint': ts },
		languageOptions: {
			parser: tsParser,
			parserOptions: { project: './tsconfig.json' }
		},
		rules: {
			...ts.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'no-empty': 'off',
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: { parser: tsParser }
		},
		rules: {
			'svelte/require-each-key': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/no-immutable-reactive-statements': 'off',
			'svelte/no-reactive-reassign': 'off',
			'svelte/no-at-html-tags': 'off',
			'no-unused-vars': 'off',
			'no-useless-assignment': 'off',
		}
	},
	{
		ignores: [
			'build/', '.svelte-kit/', 'node_modules/', 'wasm-pkg/',
			'static/',
			'src/service-worker.ts',
		]
	}
];
