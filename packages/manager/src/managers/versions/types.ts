import { VERSION_KIND } from "../../constants/VERSION_KIND";

export type VersionKind = (typeof VERSION_KIND)[keyof typeof VERSION_KIND];
export type Version = {
	version: string;
	kind: VersionKind | undefined;
};
