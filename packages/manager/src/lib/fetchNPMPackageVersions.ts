import * as t from "io-ts";
import fetch from "./fetch";

import { decode } from "./decode";

/**
 * The Accept header value used when only metadata required for package
 * installation is needed. The response includes all versions and some of their
 * metadata.
 *
 * @see https://github.com/npm/registry/blob/cfe04736f34db9274a780184d1cdb2fb3e4ead2a/docs/responses/package-metadata.md#package-metadata
 */
const NPM_REGISTRY_ABBREVIATED_METADATA_ACCEPT_HEADER =
	"application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";

/**
 * A minimally defined codec for NPM registry package metadata. Only data needed
 * for version detection is defined.
 */
const NPMRegistryPackageMetadataCodec = t.type({
	versions: t.UnknownRecord,
});

type FetchNPMPackageVersionsArgs = {
	packageName: string;
};

export const fetchNPMPackageVersions = async (
	args: FetchNPMPackageVersionsArgs,
): Promise<string[]> => {
	const res = await fetch(`https://registry.npmjs.org/${args.packageName}`, {
		headers: {
			Accept: NPM_REGISTRY_ABBREVIATED_METADATA_ACCEPT_HEADER,
		},
	});

	const json = await res.json();

	const { value, error } = decode(NPMRegistryPackageMetadataCodec, json);

	if (error) {
		throw new Error(`Invalid NPM registry response.`, { cause: error });
	}

	return Object.keys(value.versions);
};
