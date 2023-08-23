import meow from "meow";

import { name as pkgName, version as pkgVersion } from "../package.json";
import { createSliceMachineInitProcess } from "./SliceMachineInitProcess";

const cli = meow(
	`
Slice Machine init CLI help

DOCUMENTATION
  https://prismic.io/docs

VERSION
  ${pkgName}@${pkgVersion}

USAGE
  $ npx @slicemachine/init

OPTIONS
  --repository, -r         Specify a Prismic repository to use
  --starter, -s            Specify a starter to use
  --directory-name, -d     Name of a new directory for the starter

  --no-push                Don't push anything to Prismic
  --no-push-slices         Don't push slices to Prismic
  --no-push-custom-types   Don't push types to Prismic
  --no-push-documents      Don't push documents to Prismic
  --no-start-slicemachine  Don't run Slice Machine

  --help, -h              Display CLI help
  --version, -v           Display CLI version
`,
	{
		importMeta: import.meta,
		flags: {
			repository: {
				type: "string",
				alias: "r",
			},
			starter: {
				type: "string",
				alias: "s",
			},
			directoryName: {
				type: "string",
				alias: "d",
			},
			push: {
				type: "boolean",
				default: true,
			},
			pushSlices: {
				type: "boolean",
				default: true,
			},
			pushCustomTypes: {
				type: "boolean",
				default: true,
			},
			pushDocuments: {
				type: "boolean",
				default: true,
			},
			startSlicemachine: {
				type: "boolean",
				default: true,
			},
			help: {
				type: "boolean",
				alias: "h",
				default: false,
			},
			version: {
				type: "boolean",
				alias: "v",
				default: false,
			},
		},
		description: false,
		autoHelp: false,
		autoVersion: false,
		allowUnknownFlags: false,
	},
);

if (cli.flags.help) {
	cli.showHelp();
} else if (cli.flags.version) {
	// eslint-disable-next-line no-console
	console.log(`${pkgName}@${pkgVersion}`);
	process.exit(0);
} else {
	const initProcess = createSliceMachineInitProcess({
		...cli.flags,
		input: cli.input,
	});

	initProcess.run();
}
