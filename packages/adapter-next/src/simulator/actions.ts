import { SliceZone } from "@prismicio/client";

export const getSlices = (sessionID?: string): Promise<SliceZone> => {
	// Prevent tsserver + eslint warnings about unused vars.
	sessionID;

	throw new Error(
		"getSlices is designed only for use in Server Components. Use it in a server component or remove the function from your client component.",
	);
};
