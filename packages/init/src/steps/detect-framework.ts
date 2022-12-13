import { Models } from "@slicemachine/core";
import * as NodeUtils from "@slicemachine/core/build/node-utils";
import * as inquirer from "inquirer";
import { logs } from "../utils";
import Tracker from "../utils/tracker";

export type FrameworkResult = {
  value: Models.Frameworks;
  manuallyAdded: boolean;
  version: Models.Version;
};

export async function promptForFramework(): Promise<FrameworkResult> {
  const choices = Models.SupportedFrameworks.map((framework) => {
    return {
      name: NodeUtils.Framework.fancyName(framework),
      value: framework,
    };
  });

  return inquirer
    .prompt<{ framework: Models.Frameworks }>([
      {
        name: "framework",
        type: "list",
        message: "Select a framework to use",
        required: true,
        choices,
      },
    ])
    .then((res) => {
      return {
        value: res.framework,
        manuallyAdded: true,
        version: undefined,
      };
    });
}

export async function detectFramework(cwd: string): Promise<FrameworkResult> {
  const failMessage = `Please run ${logs.bold(
    "npx @slicemachine/init"
  )} in a Nuxt or Next.js project`;

  const spinner = logs.spinner(
    "Detecting framework to install correct dependencies"
  );

  spinner.start();

  try {
    const { framework, version } = NodeUtils.Framework.defineFramework({
      cwd,
      supportedFrameworks: Object.values(Models.Frameworks),
    });

    spinner.stop();

    if (!framework || framework === Models.Frameworks.vanillajs) {
      logs.writeError("Framework not detected");
      return await promptForFramework();
    }

    const nameToPrint = NodeUtils.Framework.fancyName(framework);

    if (!NodeUtils.Framework.isFrameworkSupported(framework)) {
      logs.writeError(`${nameToPrint} is currently not supported`);
      console.log(failMessage);
      process.exit(1);
    }

    logs.writeCheck(`${nameToPrint} detected`);

    return {
      value: framework,
      manuallyAdded: false,
      version,
    };
  } catch (error) {
    spinner.fail("package.json not found");

    if (error instanceof Error && error.message) {
      logs.writeError(error.message);
    } else {
      console.log(failMessage);
    }
    await Tracker.get().trackInitEndFail(
      Models.Frameworks.none,
      "Framework not detected"
    );
    process.exit(1);
  }
}
