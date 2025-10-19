module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:react-hooks/recommended', 'plugin:@typescript-eslint/recommended'],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
	settings: { react: { version: '18.2' } },
	plugins: ['react-refresh', '@typescript-eslint', 'unused-imports'],
	rules: {
		'react/jsx-no-target-blank': 'off',
		'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

		// ✅ Keraksiz importlarni ogohlantirish
		'unused-imports/no-unused-imports': 'warn',

		// ✅ Ishlatilmagan o‘zgaruvchilar
		'unused-imports/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
			},
		],

		// ❌ ESLint default no-unused-vars qoidasi o‘chirilsin
		'@typescript-eslint/no-unused-vars': 'off',
	},
}
