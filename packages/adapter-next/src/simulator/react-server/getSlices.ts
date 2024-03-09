// This `getSlices` is only accessible from Server Components.

import {
	getDefaultSlices,
	StateEvents,
	StateEventType,
} from "@prismicio/simulator/kit";
import { decompressFromEncodedURIComponent } from "lz-string";

export const getSlices = (
	state: string | null | undefined,
): StateEvents[StateEventType.Slices] => {
	return state
		? JSON.parse(decompressFromEncodedURIComponent(state))
		: getDefaultSlices();
};
