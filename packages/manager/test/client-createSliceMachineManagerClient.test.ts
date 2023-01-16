import { expect, it, vi } from "vitest";
import { Blob } from "node-fetch";

import { createSliceMachineManagerClient } from "../src/client";

vi.stubGlobal("Blob", Blob);

it("creates an RPC client for a given URL", async () => {
	const fetch = vi.fn() as typeof globalThis.fetch;
	const serverURL = "https://example.com/manager";
	const client = createSliceMachineManagerClient({ serverURL, fetch });

	try {
		await client.project.getSliceMachineConfig();
	} catch (e) {
		// This try...catch statement will throw because the mocked
		// fetch does not return the proper response. We don't care; we
		// only care that the correct URL was fetched.
	}

	expect(fetch).toHaveBeenCalledWith(serverURL, expect.anything());
});
