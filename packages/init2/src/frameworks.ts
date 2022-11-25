export type Framework = {
	/** Framework's human readable name. */
	name: string;

	/**
	 * A package name/semver range map defining framework compatibility
	 * requirements.
	 *
	 * Project should match all entries to be considered compatible.
	 */
	compatibility: Record<string, string>;

	/**
	 * A package name/semver range map defining development dependencies to be
	 * installed. Typically Slice Machine and the framework's adapter.
	 *
	 * @remarks
	 *   Dependencies required to work with the framework (e.g. `@prismicio/next`
	 *   for Next.js) should not be defined here. Those are to be defined by the
	 *   adapter.
	 */
	devDependencies: Record<string, string>;
};

const DEFAULT_DEV_DEPENDENCIES: Record<string, string> = {
	"slice-machine-ui": "<1.0.0",
};

export const FRAMEWORKS: Record<string, Framework> = {
	"nuxt-2": {
		name: "Nuxt 2",
		compatibility: {
			nuxt: "^2.0.0",
		},
		devDependencies: {
			...DEFAULT_DEV_DEPENDENCIES,
			"@slicemachine/adapter-nuxt": "latest",
		},
	},
	"next-11-13": {
		name: "Next.js 11-13",
		compatibility: {
			next: "^11.0.0 || ^12.0.0 || ^13.0.0",
		},
		devDependencies: {
			...DEFAULT_DEV_DEPENDENCIES,
			"@slicemachine/adapter-next": "latest",
		},
	},
} as const;

/** Vanilla package used when framework is not supported. */
export const VANILLA: Framework = {
	name: "vanilla (no framework)",
	compatibility: {},
	devDependencies: {
		...DEFAULT_DEV_DEPENDENCIES,
		"@slicemachine/adapter-vanilla": "latest",
	},
};
