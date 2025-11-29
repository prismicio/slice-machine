import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tsdoc from "eslint-plugin-tsdoc";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["dist/**"] },
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		plugins: {
			tsdoc,
		},
		rules: {
			"no-console": ["warn", { allow: ["info", "warn", "error"] }],
			"no-debugger": "warn",
			curly: "error",
			"prefer-const": "error",
			"padding-line-between-statements": [
				"error",
				{ blankLine: "always", prev: "*", next: "return" },
			],
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/explicit-module-boundary-types": "error",
			"tsdoc/syntax": "warn",
		},
	},
	eslintConfigPrettier,
);
