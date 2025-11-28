import { exec } from "./commandUtils";

export async function readCurrentBranchHeadTags(): Promise<Set<string>> {
	const { stdout } = await exec("git", ["tag", "--list", "--points-at"]);
	return new Set(stdout.split("\n"));
}

export async function readCurrentBranchName(): Promise<string | undefined> {
	const { stdout } = await exec("git", ["branch", "--show-current"]);
	return stdout.length > 0 ? stdout : undefined;
}
