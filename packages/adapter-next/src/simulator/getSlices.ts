import { StateEvents, StateEventType } from "@prismicio/simulator/kit";

/**
 * Returns the simulator's slices from the page's `searchParams.state` value.
 * The `state` value is set by `<SliceSimulator>`.
 *
 * **Note**: `getSlices` should only be used in the App Router with a Server
 * Component.
 */
export const getSlices = (
	state: string | null | undefined,
): StateEvents[StateEventType.Slices] => {
	// Prevent tsserver + eslint warnings about unused vars.
	state;

	throw new Error(
		"getSlices is designed only for Server Components. Convert your simulator page to a Server Component or remove the function from your Client Component.",
	);
};
