"use server";

import {
	getDefaultSlices,
	StateEvents,
	StateEventType,
} from "@prismicio/simulator/kit";
import { revalidateTag, unstable_cache } from "next/cache";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

const FILE_PATH = path.join(os.tmpdir(), "prismic-simulator", "data.json");

let memory: Partial<Record<string, StateEvents[StateEventType.Slices]>> = {};

export const getSlices = unstable_cache(
	async (sessionID?: string): Promise<StateEvents[StateEventType.Slices]> => {
		if (!sessionID) {
			return getDefaultSlices();
		}

		const contents = await readContents();

		return contents[sessionID] ?? getDefaultSlices();
	},
	["prismic-slice-simulator"],
	{ tags: ["prismic-slice-simulator"] },
);

export async function persistSlices(
	sessionID: string,
	slices: StateEvents[StateEventType.Slices],
): Promise<void> {
	const contents = await readContents();

	await writeContents({
		...contents,
		[sessionID]: slices,
	});

	revalidateTag("prismic-slice-simulator");
}

export async function cleanUpSession(sessionID: string): Promise<void> {
	const contents = await readContents();

	delete contents[sessionID];

	await writeContents(contents);

	revalidateTag("prismic-slice-simulator");
}

async function readContents() {
	if (process.env.NODE_ENV === "development") {
		try {
			const rawContents = await fs.readFile(FILE_PATH, "utf8");

			return JSON.parse(rawContents);
		} catch {
			return {};
		}
	}

	return { ...memory };
}

async function writeContents(
	contents: Partial<Record<string, StateEvents[StateEventType.Slices]>>,
): Promise<void> {
	if (process.env.NODE_ENV === "development") {
		await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
		await fs.writeFile(FILE_PATH, JSON.stringify(contents));

		return;
	}

	memory = { ...contents };
}
