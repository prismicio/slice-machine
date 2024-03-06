import { StateEvents, StateEventType } from "@prismicio/simulator/kit";

export const getSlices = (
	state: string | null | undefined,
): StateEvents[StateEventType.Slices] => {
	// Prevent tsserver + eslint warnings about unused vars.
	state;

	throw new Error(
		"getSlices is designed only for Server Components. Convert your simulator page to a server component or remove the function from your client component.",
	);
};
