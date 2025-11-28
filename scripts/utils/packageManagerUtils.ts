import { exec } from "./commandUtils";

export async function fetchPackageVersionHistory(
	name: string,
): Promise<Set<string>> {
	try {
		const { stdout } = await exec("yarn", [
			...["npm", "info", name, "--fields", "versions", "--json"],
		]);
		return new Set((JSON.parse(stdout) as { versions: string[] }).versions);
	} catch (error) {
		if (
			error instanceof Error &&
			"stdout" in error &&
			typeof error.stdout === "string" &&
			/Response Code: 404/i.test(error.stdout)
		) {
			// The package has never been published.
			return new Set();
		}
		throw error;
	}
}

export async function readNonPrivateWorkspaceNames(): Promise<Set<string>> {
	const { stdout } = await exec("yarn", [
		...["workspaces", "list", "--json", "--no-private"],
	]);
	return new Set(
		stdout
			.split("\n")
			.map((line) => (JSON.parse(line) as { name: string }).name),
	);
}

export async function readPackageVersion(name: string): Promise<string> {
	const { stdout } = await exec("yarn", ["info", name, "--all", "--json"]);
	return (JSON.parse(stdout) as { children: { Version: string } }).children
		.Version;
}
