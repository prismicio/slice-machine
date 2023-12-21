import semver from "semver";

type PackageManifest = { name: string; version: string };

type EnvironmentInfo = { environment: string; release: string };

export const getEnvironmentInfo = (pkg: PackageManifest): EnvironmentInfo => {
	const parsedPkgVersion = semver.parse(pkg.version);
	if (parsedPkgVersion === null) {
		throw new Error(
			`Package \`${pkg.name}\` has an invalid version \`${pkg.version}\` in its manifest.`,
		);
	}

	let environment;
	if (parsedPkgVersion.prerelease.length === 0) {
		environment = import.meta.env.MODE || "production";
	} else if (
		parsedPkgVersion.prerelease[0] === "alpha" ||
		parsedPkgVersion.prerelease[0] === "beta"
	) {
		environment = parsedPkgVersion.prerelease[0];
	} else {
		throw new Error(
			`Invalid package version: \`${pkg.name}@${parsedPkgVersion.version}\`. The first prerelease component \`${parsedPkgVersion.prerelease[0]}\` must be either \`alpha\` or \`beta\`.`,
		);
	}

	return { environment, release: parsedPkgVersion.version };
};
