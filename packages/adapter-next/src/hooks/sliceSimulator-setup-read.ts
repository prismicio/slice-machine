import type {
	SliceMachineContext,
	SliceSimulatorSetupReadHook,
	SliceSimulatorSetupStep,
} from "@slicemachine/plugin-kit";
import { source } from "common-tags";
import { createRequire } from "node:module";
import fetch, { Response } from "node-fetch";

import { getJSFileExtension } from "../lib/getJSFileExtension";

import type { PluginOptions } from "../types";

const REQUIRED_DEPENDENCIES = ["@prismicio/react"];

type Args = SliceMachineContext<PluginOptions>;

const createStep1 = async ({
	project,
	helpers,
}: Args): Promise<SliceSimulatorSetupStep> => {
	const require = createRequire(project.root);

	return {
		title: "Install packages",
		description: "The simulator requires some dependencies.",
		// TODO: Create a plugin runner helper to provide the correct
		// package manager
		body: source`
			The simulator requires extra dependencies. Run the following command to install them.

			~~~sh
			npm install --save ${REQUIRED_DEPENDENCIES.join(" ")}
			~~~
		`,
		validate: async () => {
			const missingDependencies: string[] = [];

			for (const dependency of REQUIRED_DEPENDENCIES) {
				try {
					// `require.resolve()` is preferred
					// over `import()` because we don't
					// want to load the module. Loading a
					// module could introduce side-effects.
					require.resolve(dependency, {
						paths: [helpers.joinPathFromRoot("node_modules")],
					});
				} catch {
					missingDependencies.push(dependency);
				}
			}

			if (missingDependencies.length >= REQUIRED_DEPENDENCIES.length) {
				return {
					title: "Missing all dependencies",
					message: source`
						Install the required dependencies to continue.
					`,
				};
			}

			if (missingDependencies.length > 0) {
				const formattedMissingDependencies = missingDependencies
					.map((missingDependency) => `\`${missingDependency}\``)
					.join(", ");

				return {
					title: "Missing some dependencies",
					message: source`
						The following dependencies are missing: ${formattedMissingDependencies}
					`,
				};
			}
		},
	};
};

const createStep2 = async ({
	helpers,
	options,
}: Args): Promise<SliceSimulatorSetupStep> => {
	const extension = await getJSFileExtension({ helpers, options, jsx: true });
	const fileName = `slice-simulator.${extension}`;
	const filePath = helpers.joinPathFromRoot("pages", fileName);

	const fileContents = await helpers.format(
		source`
			import { SliceSimulator } from "@slicemachine/adapter-next/simulator";
			import { SliceZone } from "@prismicio/react";

			import { components } from "../slices";

			export default function SliceSimulatorPage() {
				return (
					<SliceSimulator
						sliceZone={(props) => <SliceZone {...props} components={components} />}
					/>
				);
			}
		`,
		filePath,
		{
			includeNewlineAtEnd: false,
		},
	);

	return {
		title: "Create a page for the simulator",
		description: `In your \`pages\` directory, create a file called \`${fileName}\` containing this code.`,
		body: source`
			In your \`pages\` directory, create a file called \`${fileName}\` and add the following code. This route will be used to simulate and develop your components.

			~~~tsx
			${fileContents}
			~~~
		`,
	};
};

const createStep3 = async ({
	helpers,
}: Args): Promise<SliceSimulatorSetupStep> => {
	const filePath = helpers.joinPathFromRoot("slicemachine.config.json");
	const fileContents = await helpers.format(
		source`
			{
				"localSliceSimulatorURL": "http://localhost:3000/slice-simulator"
			}
		`,
		filePath,
		{
			includeNewlineAtEnd: false,
		},
	);

	return {
		title: "Update `slicemachine.config.json`",
		description: `Update your \`slicemachine.config.json\` file with a \`localSliceSimulatorURL\` property pointing to your \`/slice-simulator\` page.`,
		body: source`
			Update your \`slicemachine.config.json\` file with a \`localSliceSimulatorURL\` property pointing to your \`/slice-simulator\` page.

			~~~json
			${fileContents}
			~~~
		`,
		validate: async () => {
			const project = await helpers.getProject();

			if (!("localSliceSimulatorURL" in project.config)) {
				return {
					title: "Missing `localSliceSimulatorURL` property",
					message: source`
						A \`localSliceSimulatorURL\` property was not found in your \`slicemachine.config.json\` file.
					`,
				};
			}

			// Test if the URL is valid.
			try {
				if (project.config.localSliceSimulatorURL) {
					new URL(project.config.localSliceSimulatorURL);
				} else {
					throw new Error("Undefined Slice Simulator URL");
				}
			} catch {
				return {
					title: "An invalid URL was provided",
					message: source`
						The \`localSliceSimulatorURL\` property should be of the shape \`http://localhost:PORT/PATH\`. See the codeblock for an example.
					`,
				};
			}

			// Check if the URL is accessible.
			let res: Response | undefined = undefined;
			try {
				res = await fetch(project.config.localSliceSimulatorURL);
			} catch (error) {
				// Noop, we return if `res` is not defined
			}

			if (!res || !res.ok) {
				return {
					title: "Unable to connect to simulator page",
					message: source`
						Check that the \`localSliceSimulatorURL\` property in \`slicemachine.config.json\` is correct and try again. See the [troubleshooting page](https://prismic.io/docs/setup-nextjs) for more details.
					`,
				};
			}
		},
	};
};

export const sliceSimulatorSetupRead: SliceSimulatorSetupReadHook<
	PluginOptions
> = async (_data, context) => {
	return Promise.all([
		createStep1(context),
		createStep2(context),
		createStep3(context),
	]);
};
