/**
 * Slice Machine's published NPM package name.
 */
export const SLICE_MACHINE_NPM_PACKAGE_NAME = "slice-machine-ui";

/**
 * Slice Machine configuration filename.
 */
export const SLICE_MACHINE_CONFIG_JS = "slicemachine.config.js";
export const SLICE_MACHINE_CONFIG_TS = "slicemachine.config.ts";
export const SLICE_MACHINE_CONFIG_FILENAMES = [
	SLICE_MACHINE_CONFIG_JS,
	SLICE_MACHINE_CONFIG_TS,
] as const;

/**
 * TypeScript configuration filename.
 */
export const TS_CONFIG_FILENAME = "tsconfig.json";

/**
 * The default Slice screenshot URL used when a Slice does not have a local
 * screenshot.
 */
export const DEFAULT_SLICE_SCREENSHOT_URL =
	"https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format";
