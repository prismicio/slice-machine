import mri from "mri";
import chalk from "chalk";
import { z } from "zod";
import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";

import { exec, handleUncaughtException } from "./utils/commandUtils";

/**
 * A single output of the `yarn workspaces info` command.
 */
const Workspace = z.object({
  name: z.string(),
  location: z.string(),
  workspaceDependencies: z.array(z.string()),
  mismatchedWorkspaceDependencies: z.array(z.string()),
});
type Workspace = z.infer<typeof Workspace>;

/**
 * An `EventEmitter` used to track workspace build statuses.
 */
type BuildEmitter = Emitter<{
  built: { workspace: Workspace };
}>;

main();

type Args = {
  help: boolean;
  verbose: boolean;
};

/**
 * Runs the command.
 */
async function main() {
  process.on("uncaughtException", handleUncaughtException);

  const args = mri<Args>(process.argv.slice(2), {
    boolean: ["help", "verbose"],
    alias: { h: "help", v: "verbose" },
    default: {
      help: false,
      verbose: false,
    },
  });

  if (args.help) {
    console.info(
      `
Usage:
    yarn dev [options...]

Options:
    --verbose, -v  Print all output from the dev scripts
    --help, -h     Show help text
`.trim(),
    );

    return;
  }

  const workspaces = await getWorkspaces();
  const packages = workspaces.filter((workspace) =>
    workspace.location.startsWith("packages/"),
  );
  const runningWorkspaces = new Set<string>();
  const builtWorkspaces = new Set<string>();
  const buildEmitter: BuildEmitter = createEmitter();
  buildEmitter.on("built", () => {
    if (packages.every((pkg) => builtWorkspaces.has(pkg.location))) {
      console.info(chalk.green(`Ready and watching:`));

      for (const builtWorkspace of builtWorkspaces) {
        const workspace = workspaces.find((w) => w.location === builtWorkspace);

        if (workspace) {
          console.info(chalk.green` - ${workspace.name}`);
        }
      }
    }
  });

  for (const pkg of packages) {
    runWorkspace(
      pkg,
      { workspaces, buildEmitter, builtWorkspaces, runningWorkspaces },
      { verbose: args.verbose },
    );
  }

  process.off("uncaughtException", handleUncaughtException);
}

/**
 * Runs a workspace's `dev` script.
 *
 * @param workspace - The `Workspace` with a `dev` script.
 * @param ctx - Context used to keep track of the script's process.
 * @param options - Options that affect the output.
 */
async function runWorkspace(
  workspace: Workspace,
  ctx: {
    workspaces: Workspace[];
    runningWorkspaces: Set<string>;
    builtWorkspaces: Set<string>;
    buildEmitter: BuildEmitter;
  },
  options: { verbose: boolean },
) {
  if (workspace.workspaceDependencies.length > 0) {
    for (const dependencyLocation of workspace.workspaceDependencies) {
      const dependencyWorkspace = ctx.workspaces.find(
        (workspace) => workspace.location === dependencyLocation,
      );

      if (dependencyWorkspace) {
        runWorkspace(dependencyWorkspace, ctx, options);
      }
    }

    let resolve: () => void;
    const dependenciesBuildPromise = new Promise<void>((res) => {
      resolve = res;
    });
    ctx.buildEmitter.on("built", () => {
      const allWorkspaceDependenciesAreBuilt =
        workspace.workspaceDependencies.every((dependencyLocation) =>
          ctx.builtWorkspaces.has(dependencyLocation),
        );

      if (allWorkspaceDependenciesAreBuilt) {
        resolve();
      }
    });
    await dependenciesBuildPromise;
  }

  if (ctx.runningWorkspaces.has(workspace.location)) {
    return;
  }

  console.info(namespaceStr(workspace.name, "Starting initial build"));
  ctx.runningWorkspaces.add(workspace.location);

  const command = spawn("yarn", ["workspace", workspace.name, "dev"], {
    env: { FORCE_COLOR: "true", ...process.env },
  });

  command.stdout.on("data", (data) => {
    const str = data.toString();

    if (options.verbose) {
      console.log(
        namespaceLines(workspace.name, removeTrailingNewLine(data.toString())),
      );
    }

    if (
      // Vite build success message
      /built in \d+ms/.test(str) ||
      // Next.js build success message
      /compiled client and server successfully in \d+ ms/.test(str)
    ) {
      if (ctx.builtWorkspaces.has(workspace.location)) {
        console.info(namespaceStr(workspace.name, "Finished build"));
      } else {
        console.info(
          namespaceStr(workspace.name, "Finished initial build", {
            color: chalk.blue,
          }),
        );
      }

      ctx.builtWorkspaces.add(workspace.location);
      ctx.buildEmitter.emit("built", { workspace });
    }
  });

  command.stderr.on("data", (data) => {
    console.error(
      namespaceLines(workspace.name, removeTrailingNewLine(data.toString()), {
        color: chalk.red,
      }),
    );
  });

  command.on("exit", (code) => {
    console.info(namespaceStr(workspace.name, `Exited (code: ${code})`));
  });
}

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

/**
 * Creates a typed `EventEmitter`.
 *
 * @typeParam TEventMap - A map of event names to their arguments.
 *
 * @returns An `EventEmitter` typed with `TEventMap`.
 */
function createEmitter<TEventMap extends EventMap>(): Emitter<TEventMap> {
  const emitter = new EventEmitter();

  emitter.setMaxListeners(100);

  return emitter;
}

/**
 * Retrieve a list of workspaces in the project.
 *
 * @returns A list of workspaces in the project.
 */
async function getWorkspaces() {
  const { stdout: rawList } = await exec("yarn", [
    "workspaces",
    "list",
    "--json",
    "--verbose",
  ]);

  // The first entry is the root-level workspace, which we will ignore.
  return rawList
    .split("\n")
    .slice(1)
    .map((item) => Workspace.parse(JSON.parse(item)));
}

/**
 * Prefixes multiple lines using `namespaceStr`.
 *
 * @param namespace - The namespace to prefix.
 * @param lines - The string or strings to be prefixed.
 * @param options - Options that affect the output.
 *
 * @returns `lines` with each line prefixed with `namespace`.
 */
function namespaceLines(
  namespace: string,
  lines: string | string[],
  args: { color?: chalk.Chalk } = {},
) {
  if (typeof lines === "string") {
    lines = lines.split("\n");
  }

  return lines.map((line) => namespaceStr(namespace, line, args)).join("\n");
}

/**
 * Prefixes a colored namespace to a given string.
 *
 * @param namespace - The namespace to prefix.
 * @param str - The string to be prefixed.
 * @param options - Options that affect the output.
 *
 * @returns `str` prefixed with `namespace`.
 */
function namespaceStr(
  namespace: string,
  str: string,
  options: { color?: chalk.Chalk } = {},
) {
  const { color = chalk.gray } = options;

  return `${color`[${namespace}]`} ${str}`;
}

/**
 * Removes the trailing `\n` on a given string, if there is one.
 *
 * @param input - The string from which the trailing `\n` is removed.
 *
 * @returns `input` without a trailing `\n`.
 */
function removeTrailingNewLine(input: string) {
  return input.replace(/\n$/, "");
}
