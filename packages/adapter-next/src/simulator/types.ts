/**
 * Parameters provided to the Slice Simulator page.
 *
 * **Note**: `SliceSimulatorParams` should only be used in the App Router with a
 * Server Component.
 */
export type SliceSimulatorParams = {
	searchParams: Promise<{
		state?: string;
	}>;
};
