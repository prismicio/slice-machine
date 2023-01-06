import { readFile } from "node:fs/promises";
import { join } from "node:path";

import semver from "semver";

export type Framework = {
	/**
	 * Framework's human readable name.
	 */
	name: string;

	/**
	 * Framework's name sent to Prismic
	 */
	prismicName: string;

	/**
	 * Package name of the adapter responsible for this framework
	 */
	adapterName: string;

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
	 * Dependencies required to work with the framework (e.g. `@prismicio/next`
	 * for Next.js) should not be defined here. Those are to be defined by the
	 * adapter.
	 */
	devDependencies: Record<string, string>;
};

const DEFAULT_DEV_DEPENDENCIES: Record<string, string> = {
	"slice-machine-ui": "<1.0.0",
};

export const FRAMEWORKS: Record<string, Framework> = {
	"nuxt-2": {
		name: "Nuxt 2",
		prismicName: "nuxt-2",
		adapterName: "@slicemachine/adapter-nuxt",
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
		prismicName: "next-11-13",
		adapterName: "@slicemachine/adapter-next",
		compatibility: {
			next: "^11.0.0 || ^12.0.0 || ^13.0.0",
		},
		devDependencies: {
			...DEFAULT_DEV_DEPENDENCIES,
			"@slicemachine/adapter-next": "latest",
		},
	},
} as const;

/**
 * Universal package used when framework is not supported.
 */
export const UNIVERSAL: Framework = {
	name: "universal (no framework)",
	prismicName: "universal",
	adapterName: "@slicemachine/adapter-universal",
	compatibility: {},
	devDependencies: {
		...DEFAULT_DEV_DEPENDENCIES,
		"@slicemachine/adapter-universal": "latest",
	},
};

export const detectFramework = async (cwd: string): Promise<Framework> => {
	const path = join(cwd, "package.json");

	let allDependencies: Record<string, string>;
	try {
		const pkg = JSON.parse(await readFile(path, "utf-8"));

		allDependencies = {
			...pkg.dependencies,
			...pkg.devDependencies,
		};
	} catch (error) {
		throw new Error(
			`Failed to read project's \`package.json\` at \`${path}\``,
			{ cause: error },
		);
	}

	return (
		Object.values(FRAMEWORKS).find((framework) => {
			return Object.entries(framework.compatibility).every(([pkg, range]) => {
				if (pkg in allDependencies) {
					// Determine lowest version possibly in use
					const minimumVersion = semver.minVersion(allDependencies[pkg]);

					// Unconventional tags, `latest`, `beta`, `dev`
					if (!minimumVersion) {
						return true;
					}

					return semver.satisfies(minimumVersion, range);
				}

				return false;
			});
		}) || UNIVERSAL
	);
};
