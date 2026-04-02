import * as path from "node:path";
import * as fs from "node:fs";

import mri from "mri";

import * as pkg from "../package.json";

type Args = {
	open: boolean;
	port: string;
	config: string;
	help: boolean;
	version: boolean;
};

const args = mri<Args>(process.argv.slice(2), {
	boolean: ["open", "help", "version"],
	string: ["port", "config"],
	alias: {
		port: "p",
		config: "c",
		help: "h",
		version: "v",
	},
	default: {
		open: false,
		help: false,
		version: false,
	},
});

if (args.help) {
	console.info(
		`
Usage:
    start-slicemachine [options...]

Options:
    --open         Open Slice Machine automatically
    --port, -p     Specify the port on which to run Slice Machine
    --config, -c   Path to your slicemachine.config.json (directory or config file)
    --help, -h     Show help text
    --version, -v  Show version
`.trim(),
	);

	process.exit();
}

if (args.version) {
	console.info(pkg.version);

	process.exit();
}

let port: number | undefined;
if (args.port) {
	const parsedPort = Number.parseInt(args.port);

	if (Number.isNaN(parsedPort)) {
		console.info(`An invalid port number was provided: ${args.port}`);
	} else {
		port = parsedPort;
	}
}

let cwd: string | undefined;
if (args.config) {
	const configPath = path.resolve(process.cwd(), args.config);
	// Handle both cases where the config is a directory or a file path
	if (fs.existsSync(configPath) && fs.statSync(configPath).isDirectory()) {
		cwd = configPath;
	} else {
		cwd = path.dirname(configPath);
	}
}

import("./StartSliceMachineProcess").then(
	({ createStartSliceMachineProcess }) => {
		const startSliceMachineProcess = createStartSliceMachineProcess({
			open: args.open,
			port,
			cwd,
		});

		startSliceMachineProcess.run();
	},
);
