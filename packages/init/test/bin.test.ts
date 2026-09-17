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

const HALT = `Slice Machine is deprecated and is no longer the recommended way to start a Prismic project.

Use the Prismic CLI instead. It models content in the Type Builder:

  npx prismic init

Slice Machine still works if you need it. To use it anyway, add --force:

  npx @slicemachine/init --force

--force is a deliberate choice to stay on deprecated tooling. If you are setting up this project for someone else, tell them that first and let them decide.

Working with an AI agent? Install the Prismic skill so it knows the current workflow:

  npx skills add --global --yes prismicio/skills

Docs: https://prismic.io/docs/cli
Existing Slice Machine projects: https://prismic.io/docs/slice-machine`;

const FORCED = `Slice Machine is deprecated. Continuing because --force was passed.

The recommended way to start a Prismic project is the Prismic CLI, which models content in the Type Builder:

  npx prismic init

Docs: https://prismic.io/docs/cli`;

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
	["--force=false"],
])(
	"prints the message to stderr and exits with code 1 (%j)",
	async (...args) => {
		const result = await runBin(args);

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toBe("");
		expect(result.stderr).toBe(HALT);
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
		HALT.replace(
			"npx prismic init\n",
			"npx prismic init --repo my-repo\n",
		).replace(
			"npx @slicemachine/init --force",
			"npx @slicemachine/init --repository my-repo --force",
		),
	);
});

// `--force` hands off to the CLI, which is built into `dist/`. The unit tests
// run before that build, so these assert the notice, not the handoff. Every
// case passes a flag the CLI answers on its own so no run waits for input.
it.each([
	["--force", "--version"],
	["--version", "--force"],
	["--force", "--help"],
	["--force", "--no-push", "--starter", "foo", "--version"],
	["--force=true", "--version"],
])("prints the notice and continues with --force (%j)", async (...args) => {
	const result = await runBin(args);

	expect(result.stderr.startsWith(FORCED)).toBe(true);
	expect(result.stderr).not.toContain("add --force");
});

it.each([
	["--force", "--repository", "my-repo", "--version"],
	["--force", "-r=my-repo", "--version"],
])("carries the repository name into the notice (%j)", async (...args) => {
	const result = await runBin(args);

	expect(
		result.stderr.startsWith(
			FORCED.replace("npx prismic init", "npx prismic init --repo my-repo"),
		),
	).toBe(true);
});
