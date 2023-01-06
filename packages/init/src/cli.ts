import meow from "meow";

import { name as pkgName, version as pkgVersion } from "../package.json";
import { createSliceMachineInitProcess } from "./SliceMachineInitProcess";

const cli = meow(
	`
Prismic Slice Machine Init CLI

DOCUMENTATION
  https://prismic.io/docs

VERSION
  ${pkgName}@${pkgVersion}

USAGE
  $ npx @slicemachine/init

OPTIONS
  --repository, -r        Specify a Prismic repository to use

  --no-push               For starters, prevent anyuthing from being pushed
  --no-push-slices        For starters, prevent slices from being pushed
  --no-push-custom-types  For starters, prevent custom types from being pushed
  --no-push-documents     For starters, prevent documents from being pushed

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
