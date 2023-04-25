import { readFile } from "node:fs/promises";
import { join } from "node:path";

import semver from "semver";

export type Framework = {
	/**
	 * Framework's human readable name.
	 */
	name: string;

	/**
	 * Package name of the adapter responsible for this framework.
	 */
	adapterName: string;

	/**
	 * Semver range of the adapter responsible for this framework.
	 */
	adapterVersion: string;

	/**
	 * Whether or not to run the project init hook to migrate legacy frameworks.
	 */
	runProjectInitHook: boolean;

	/**
	 * A package name/semver range map defining framework compatibility
	 * requirements.
	 *
	 * Project should match all entries to be considered compatible.
	 */
	compatibility: Record<string, string>;
};

/**
 * Frameworks we support, orders shouldn't matter much but is respected (the
 * higher it is the more priority it has in case multiple matches)
 */
export const FRAMEWORKS: Record<string, Framework> = {
	previousNuxt: {
		name: "Nuxt 2 (legacy)",
		adapterName: "@slicemachine/adapter-nuxt2",
		adapterVersion: "latest",
		runProjectInitHook: true,
		compatibility: {
			nuxt: "^2.0.0",
			"nuxt-sm": "*",
		},
	},
	nuxt: {
		name: "Nuxt 2",
		adapterName: "@slicemachine/adapter-nuxt2",
		adapterVersion: "latest",
		runProjectInitHook: false,
		compatibility: {
			nuxt: "^2.0.0",
		},
	},
	previousNext: {
		name: "Next.js 11-13 (legacy)",
		adapterName: "@slicemachine/adapter-next",
		adapterVersion: "latest",
		runProjectInitHook: true,
		compatibility: {
			next: "^11.0.0 || ^12.0.0 || ^13.0.0",
			"prismic-reactjs": "*",
		},
	},
	next: {
		name: "Next.js 11-13",
		adapterName: "@slicemachine/adapter-next",
		adapterVersion: "latest",
		runProjectInitHook: false,
		compatibility: {
			next: "^11.0.0 || ^12.0.0 || ^13.0.0",
		},
	},
} as const;

/**
 * Universal package used when framework is not supported.
 */
export const UNIVERSAL: Framework = {
	name: "universal (no framework)",
	adapterName: "@slicemachine/adapter-universal",
	adapterVersion: "latest",
	runProjectInitHook: false,
	compatibility: {},
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
					try {
						// Determine lowest version possibly in use
						const minimumVersion = semver.minVersion(allDependencies[pkg]);

						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						return semver.satisfies(minimumVersion!, range);
					} catch (error) {
						// We assume unconventional tags, `latest`, `beta`, `dev` matches the framework
						return true;
					}
				}

				return false;
			});
		}) || UNIVERSAL
	);
};
