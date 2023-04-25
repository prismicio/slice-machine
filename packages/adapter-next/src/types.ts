export type PluginOptions = {
	format?: boolean;
	lazyLoadSlices?: boolean;
} & (
	| {
			typescript?: false;
			jsxExtension?: boolean;
	  }
	| {
			typescript: true;
			jsxExtension?: never;
	  }
);
