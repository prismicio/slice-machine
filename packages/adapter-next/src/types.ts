export type PluginOptions = {
	/**
	 * Determines if generated files should be formatted using Prettier.
	 *
	 * @defaultValue `true`
	 */
	format?: boolean;

	/**
	 * Determines if Slice components should be lazy loaded when rendered.
	 *
	 * @defaultValue `true`
	 */
	lazyLoadSlices?: boolean;

	/**
	 * The filepath at which generated TypeScript types will be saved.
	 *
	 * @defaultValue `prismicio-types.d.ts`
	 */
	generatedTypesFilePath?: string;

	/**
	 * The filepath at which the active Prismic environment is stored as an
	 * environment variable.
	 *
	 * @defaultValue `.env.local`
	 */
	environmentVariableFilePath?: string;
} & (
	| {
			/**
			 * Determines if generated files should be written in TypeScript or
			 * JavaScript.
			 *
			 * @defaultValue `true` if the project contains a `tsconfig.json`, `false` otherwise.
			 */
			typescript?: false;

			/**
			 * Determines if generated JavaScript files should use a `.jsx` file
			 * extension.
			 *
			 * @defaultValue `false`
			 */
			jsxExtension?: boolean;
	  }
	| {
			/**
			 * Determines if generated files should be written in TypeScript or
			 * JavaScript.
			 *
			 * @defaultValue `true` if the project contains a `tsconfig.json`, `false` otherwise.
			 */
			typescript: true;

			/**
			 * Determines if generated JavaScript files should use a `.jsx` file
			 * extension.
			 *
			 * @defaultValue `false`
			 */
			jsxExtension?: never;
	  }
);
