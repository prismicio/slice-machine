module.exports = {
	parserOptions: {
		project: ["../../tsconfig-node.json", "./tsconfig.json"],
		tsconfigRootDir: __dirname,
	},
	extends: [
		"plugin:react-hooks/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"eslint-config-prettier",
		"../../.eslintrc.cjs",
	],
	rules: {
		"@typescript-eslint/prefer-nullish-coalescing": "warn",
		"@typescript-eslint/strict-boolean-expressions": "warn",
		// TODO: align these rules with base config
		curly: "off",
		"padding-line-between-statements": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"prettier/prettier": "off",
	},
};
