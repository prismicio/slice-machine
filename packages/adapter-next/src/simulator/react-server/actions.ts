"use server";

import { SliceZone } from "@prismicio/client";
import { getDefaultSlices } from "@prismicio/simulator/kit";
import { revalidatePath } from "next/cache";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

const FILE_PATH = path.join(os.tmpdir(), "prismic-simulator", "data.json");

let memory: Partial<Record<string, SliceZone>> = {};

export async function getSlices(sessionID?: string): Promise<SliceZone> {
	if (!sessionID) {
		return getDefaultSlices();
	}

	const contents = await readContents();

	return contents[sessionID] ?? getDefaultSlices();
}

export async function persistSlices(
	sessionID: string,
	slices: SliceZone,
	simulatorPath = "/slice-simulator",
): Promise<void> {
	const contents = await readContents();

	await writeContents({
		...contents,
		[sessionID]: slices,
	});

	revalidatePath(simulatorPath);
}

export async function cleanUpSession(
	sessionID: string,
	simulatorPath = "/slice-simulator",
): Promise<void> {
	const contents = await readContents();

	delete contents[sessionID];

	await writeContents(contents);

	revalidatePath(simulatorPath);
}

async function readContents(): Promise<Partial<Record<string, SliceZone>>> {
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
	contents: Partial<Record<string, SliceZone>>,
): Promise<void> {
	if (process.env.NODE_ENV === "development") {
		await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
		await fs.writeFile(FILE_PATH, JSON.stringify(contents));

		return;
	}

	memory = { ...contents };
}
