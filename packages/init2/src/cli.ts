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

  --help, -h     Display CLI help
  --version, -v  Display CLI version
`,
	{
		importMeta: import.meta,
		flags: {
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
	}
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
