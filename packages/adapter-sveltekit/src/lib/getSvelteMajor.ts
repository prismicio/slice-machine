export const getSvelteMajor = async (): Promise<number> => {
	const { version } = await import("svelte/package.json");

	const major = Number.parseInt(version.split(".")[0]);
	if (major === Number.NaN) {
		throw new Error(
			`Unable to parse svelte's installed version number: "${version}"`,
		);
	}

	return major;
};
