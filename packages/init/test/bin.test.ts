import { expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

const BIN = fileURLToPath(
	new URL("../bin/slicemachine-init.js", import.meta.url),
);

// The manager reads the user-level `.prismicrc` from `XDG_CONFIG_HOME`. The
// fixture's file disables telemetry so tests never reach Segment.
const XDG_CONFIG_HOME = fileURLToPath(
	new URL("./__fixtures__/telemetry-disabled/", import.meta.url),
);

const MESSAGE = `Slice Machine is deprecated and no longer creates new projects.

New Prismic projects use the Type Builder and the Prismic CLI:

  npx prismic init

Using an AI agent? Install the Prismic skill so it uses the CLI:

  npx skills add --global --yes prismicio/skills

Docs: https://prismic.io/docs/cli
Existing Slice Machine projects: https://prismic.io/docs/slice-machine`;

const runBin = (args: string[]) => {
	return execa(process.execPath, [BIN, ...args], {
		env: { XDG_CONFIG_HOME },
		reject: false,
	});
};

it.each([
	[],
	["--help"],
	["-h"],
	["--version"],
	["-v"],
	["--starter", "nextjs-starter-prismic-minimal"],
	["--no-push"],
	["--unknown-flag"],
	["--repository"],
])(
	"prints the message to stderr and exits with code 1 (%j)",
	async (...args) => {
		const result = await runBin(args);

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toBe("");
		expect(result.stderr).toBe(MESSAGE);
	},
);

it.each([
	["--repository", "my-repo"],
	["--repository=my-repo"],
	["-r", "my-repo"],
	["-r=my-repo"],
	["--no-push", "--repository", "my-repo", "--starter", "foo"],
])("carries the repository name into --repo (%j)", async (...args) => {
	const result = await runBin(args);

	expect(result.exitCode).toBe(1);
	expect(result.stdout).toBe("");
	expect(result.stderr).toBe(
		MESSAGE.replace("npx prismic init", "npx prismic init --repo my-repo"),
	);
});
