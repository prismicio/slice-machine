import { type PrismicManager } from "@prismicio/manager";
import { readFile, readdir, rm } from "node:fs/promises";
import adapterNextPlugin from "@prismicio/adapter-next";
import adapterNuxtPlugin from "@prismicio/adapter-nuxt";
import adapterNuxt2Plugin from "@prismicio/adapter-nuxt2";
import adapterSveltekitPlugin from "@prismicio/adapter-sveltekit";
import { join } from "node:path";
import semver from "semver";

import { listrRun } from "../utils/listr";
import { type ProjectContext } from "./project";

export type Framework = {
	/**
	 * Framework's human readable name.
	 */
	name: string;

	/**
	 * Framework 's id sent to Segment from Slice Machine
	 */
	telemetryID: "next" | "nuxt-2" | "nuxt" | "sveltekit-1" | "sveltekit-2";

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
};

/**
 * Frameworks we support, orders shouldn't matter much but is respected (the
 * higher it is the more priority it has in case multiple matches)
 */
export const FRAMEWORKS: Record<string, Framework> = {
	"nuxt-2": {
		name: "Nuxt 2",
		telemetryID: "nuxt-2",
		adapterName: "@prismicio/adapter-nuxt2",
		compatibility: {
			nuxt: "^2.0.0",
		},
	},
	nuxt: {
		name: "Nuxt",
		telemetryID: "nuxt",
		adapterName: "@prismicio/adapter-nuxt",
		compatibility: {
			nuxt: "^3.0.0 || ^4.0.0",
		},
	},
	next: {
		name: "Next.js",
		telemetryID: "next",
		adapterName: "@prismicio/adapter-next",
		compatibility: {
			next: "^11 || ^12 || ^13 || ^14 || ^15 || ^16.0.0-beta.0",
		},
	},
	"sveltekit-1": {
		name: "SvelteKit",
		telemetryID: "sveltekit-1",
		adapterName: "@prismicio/adapter-sveltekit",
		compatibility: {
			"@sveltejs/kit": "^1.0.0",
		},
	},
	"sveltekit-2": {
		name: "SvelteKit",
		telemetryID: "sveltekit-2",
		adapterName: "@prismicio/adapter-sveltekit",
		compatibility: {
			"@sveltejs/kit": "^2.0.0",
		},
	},
} as const;

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

	const framework = Object.values(FRAMEWORKS).find((framework) => {
		return Object.entries(framework.compatibility).every(([pkg, range]) => {
			if (pkg in allDependencies) {
				try {
					// Determine lowest version possibly in use
					const minimumVersion = semver.minVersion(allDependencies[pkg]);

					return semver.satisfies(minimumVersion!, range);
				} catch {
					// We assume unconventional tags, `latest`, `beta`, `dev` matches the framework
					return true;
				}
			}

			return false;
		});
	});

	if (!framework) {
		throw new Error("No framework compatible with Prismic was found.");
	}

	return framework;
};

type InitFrameworkArgs = {
	manager: PrismicManager;
	projectContext: ProjectContext;
};

export async function initFramework(args: InitFrameworkArgs): Promise<void> {
	const { manager, projectContext } = args;
	const { framework } = projectContext;

	await listrRun([
		{
			title: `Initializing project for ${framework.name}...`,
			task: async (_, parentTask) => {
				const updateOutput = (data: Buffer | string | null) => {
					if (data instanceof Buffer) {
						parentTask.output = data.toString();
					} else if (typeof data === "string") {
						parentTask.output = data;
					}
				};
				await manager.project.initProject({
					log: updateOutput,
				});

				// TODO: Export simulator management out of adapter and remove this code
				const projectRoot = await manager.project.getRoot();
				const entries = await readdir(projectRoot, {
					recursive: true,
					withFileTypes: true,
				});
				for (const entry of entries) {
					if (entry.isDirectory() && entry.name === "slice-simulator") {
						await rm(join(entry.path, entry.name), {
							recursive: true,
							force: true,
						});
					}
				}

				parentTask.title = `Updated project for ${framework.name}`;
			},
		},
	]);
}

export const FRAMEWORK_PLUGINS = {
	"@prismicio/adapter-next": adapterNextPlugin,
	"@prismicio/adapter-nuxt": adapterNuxtPlugin,
	"@prismicio/adapter-nuxt2": adapterNuxt2Plugin,
	"@prismicio/adapter-sveltekit": adapterSveltekitPlugin,
};
