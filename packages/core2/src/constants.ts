/**
 * Slice Machine's published NPM package name.
 */
export const SLICE_MACHINE_NPM_PACKAGE_NAME = "slice-machine-ui";

export const SLICE_MACHINE_CONFIG_FILENAMES = [
	"slicemachine.config.ts",
	"slicemachine.config.js",
] as const;

export const ApplicationMode = {
	PROD: "prod",
	STAGE: "stage",
	DEV: "dev",
} as const;

export const SLICE_MACHINE_USER_AGENT = "slice-machine";

// TODO: (Maybe) Turn this constant in to function. The function can still be
// statically analyzable to get proper types and remove dead code. However, a
// function would let us handle additional environments more cleanly than we
// could using ternaries.
export const APIEndpoints =
	process.env.SM_ENV === ApplicationMode.STAGE
		? ({
				PrismicWroom: "https://wroom.io/",
				PrismicAuthentication: "https://auth.wroom.io/",
				PrismicModels: "https://customtypes.wroom.io/",
				PrismicUser: "https://user.wroom.io/",
				AwsAclProvider:
					"https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
		  } as const)
		: ({
				PrismicWroom: "https://prismic.io/",
				PrismicAuthentication: "https://auth.prismic.io/",
				PrismicModels: "https://customtypes.prismic.io/",
				PrismicUser: "https://user.internal-prismic.io/",
				AwsAclProvider:
					"https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
		  } as const);

/**
 * The default Slice screenshot URL used when a Slice does not have a local
 * screenshot.
 */
export const DEFAULT_SLICE_SCREENSHOT_URL =
	"https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format";
