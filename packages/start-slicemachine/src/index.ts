import {
	PrismicUserProfile,
	SliceMachineManager,
	createSliceMachineManager,
} from "@slicemachine/core2";

import { listen } from "./lib/listen";

import { createSliceMachineServer } from "./createSliceMachineServer";

type FetchProfileArgs = {
	sliceMachineManager: SliceMachineManager;
};

const fetchProfile = async (
	args: FetchProfileArgs
): Promise<PrismicUserProfile | undefined> => {
	const isLoggedIn = await args.sliceMachineManager.user.checkIsLoggedIn();

	if (isLoggedIn) {
		return await args.sliceMachineManager.user.getProfile();
	}
};

type ValidateEnvironmentArgs = {
	sliceMachineManager: SliceMachineManager;
};

const validateEnvironment = async (
	args: ValidateEnvironmentArgs
): Promise<void> => {
	// Validate Slice Machine config.
	await args.sliceMachineManager.project.loadSliceMachineConfig();

	// Validate Slice models.
	const allSlices = await args.sliceMachineManager.slices.readAllSlices();
	if (allSlices.errors.length > 0) {
		// TODO: Provide better error message.
		throw new Error(allSlices.errors.join(", "));
	}

	// Validate Custom Type models.
	const allCustomTypes =
		await args.sliceMachineManager.customTypes.readAllCustomTypes();
	if (allCustomTypes.errors.length > 0) {
		// TODO: Provide better error message.
		throw new Error(allCustomTypes.errors.join(", "));
	}
};

const run = async (): Promise<void> => {
	const sliceMachineManager = createSliceMachineManager();
	const server = await createSliceMachineServer({ sliceMachineManager });

	await sliceMachineManager.plugins.initPlugins();

	await validateEnvironment({ sliceMachineManager });

	const { address } = await listen(server, { port: 9999 });

	console.info("Slice Machine started");
	console.info(`Running on: http://localhost:${address.port}`);

	const profile = await fetchProfile({ sliceMachineManager });

	console.info(`Logged in as: ${profile?.email || "Not logged in"}`);
};

export default async function start(): Promise<void> {
	try {
		await run();
	} catch (error) {
		console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
		console.error("Full error: ", error);
	}
}
