import mri from "mri";

import * as pkg from "../package.json";

type Args = {
	open: boolean;
	port: string;
	help: boolean;
	version: boolean;
};

const args = mri<Args>(process.argv.slice(2), {
	boolean: ["open", "help", "version"],
	string: ["port"],
	alias: {
		port: "p",
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

import("./StartSliceMachineProcess").then(
	({ createStartSliceMachineProcess }) => {
		const startSliceMachineProcess = createStartSliceMachineProcess({
			open: args.open,
			port,
		});

		startSliceMachineProcess.run();
	},
);
