import { readFile } from "node:fs/promises";
import { join } from "node:path";
import semver from "semver";

import { FrameworkWroomTelemetryID } from "@slicemachine/manager";

import { version as pkgVersion } from "../../package.json";

export type Framework = {
	/**
	 * Framework's human readable name.
	 */
	name: string;

	/**
	 * Framework 's id sent to Segment from Slice Machine
	 */
	sliceMachineTelemetryID:
		| "next"
		| "nuxt-2"
		| "nuxt-3"
		| "sveltekit-1"
		| "universal";

	/**
	 * Framework's id sent to Segment from wroom.
	 */
	wroomTelemetryID: FrameworkWroomTelemetryID;

	/**
	 * A link to the Prismic documentation for the framework
	 */
	prismicDocumentation: string;

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

const isPrerelease =
	semver.prerelease(pkgVersion) !== null && process.env.NODE_ENV !== "test";

const DEFAULT_DEV_DEPENDENCIES: Record<string, string> = {
	"slice-machine-ui": isPrerelease ? "alpha" : "latest",
};

/**
 * Frameworks we support, orders shouldn't matter much but is respected (the
 * higher it is the more priority it has in case multiple matches)
 */
export const FRAMEWORKS: Record<string, Framework> = {
	"nuxt-2": {
		name: "Nuxt 2",
		sliceMachineTelemetryID: "nuxt-2",
		wroomTelemetryID: "nuxt",
		prismicDocumentation: "https://prismic.dev/init/nuxt-2",
		adapterName: "@slicemachine/adapter-nuxt2",
		compatibility: {
			nuxt: "^2.0.0",
		},
		devDependencies: {
			...DEFAULT_DEV_DEPENDENCIES,
			"@slicemachine/adapter-nuxt2": isPrerelease ? "alpha" : "latest",
		},
	},
	"nuxt-3": {
		name: "Nuxt 3",
		sliceMachineTelemetryID: "nuxt-3",
		wroomTelemetryID: "nuxt",
		prismicDocumentation: "https://prismic.dev/init/nuxt-3",
		adapterName: "@slicemachine/adapter-nuxt",
		compatibility: {
			nuxt: "^3.0.0",
		},
		devDependencies: {
			...DEFAULT_DEV_DEPENDENCIES,
			"@slicemachine/adapter-nuxt": isPrerelease ? "alpha" : "latest",
		},
	},
	next: {
		name: "Next.js",
		sliceMachineTelemetryID: "next",
		wroomTelemetryID: "next",
		prismicDocumentation: "https://prismic.dev/init/next",
		adapterName: "@slicemachine/adapter-next",
		compatibility: {
			next: ">=11.0.0",
		},
		devDependencies: {
			...DEFAULT_DEV_DEPENDENCIES,
			"@slicemachine/adapter-next": isPrerelease ? "alpha" : "latest",
		},
	},
	"sveltekit-1": {
		name: "SvelteKit",
		sliceMachineTelemetryID: "sveltekit-1",
		wroomTelemetryID: "sveltekit",
		prismicDocumentation: "https://prismic.dev/init/sveltekit-1",
		adapterName: "@slicemachine/adapter-sveltekit",
		compatibility: {
			"@sveltejs/kit": "^1.0.0",
		},
		devDependencies: {
			...DEFAULT_DEV_DEPENDENCIES,
			"@slicemachine/adapter-sveltekit": isPrerelease ? "alpha" : "latest",
		},
	},
} as const;

/**
 * Universal package used when framework is not supported.
 */
export const UNIVERSAL: Framework = {
	name: "universal (no framework)",
	sliceMachineTelemetryID: "universal",
	wroomTelemetryID: "other",
	prismicDocumentation: "https://prismic.dev/init/universal",
	adapterName: "@slicemachine/adapter-universal",
	compatibility: {},
	devDependencies: {
		...DEFAULT_DEV_DEPENDENCIES,
		"@slicemachine/adapter-universal": isPrerelease ? "alpha" : "latest",
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
