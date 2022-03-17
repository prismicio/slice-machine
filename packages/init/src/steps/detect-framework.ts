import { Models, NodeUtils } from "@slicemachine/core";
import * as inquirer from "inquirer";

export type FrameworkResult = {
  value: Models.Frameworks;
  manuallyAdded: boolean;
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
      };
    });
}

export async function detectFramework(cwd: string): Promise<FrameworkResult> {
  const failMessage = `Please run ${NodeUtils.logs.bold(
    "npx @slicemachine/init"
  )} in a Nuxt or Next.js project`;

  const spinner = NodeUtils.logs.spinner(
    "Detecting framework to install correct dependencies"
  );

  spinner.start();

  try {
    const maybeFramework = NodeUtils.Framework.defineFramework({
      cwd,
      supportedFrameworks: Object.values(Models.Frameworks),
    });

    spinner.stop();

    if (!maybeFramework || maybeFramework === Models.Frameworks.vanillajs) {
      NodeUtils.logs.writeError("Framework not detected");
      return await promptForFramework();
    }

    const nameToPrint = NodeUtils.Framework.fancyName(maybeFramework);

    if (!NodeUtils.Framework.isFrameworkSupported(maybeFramework)) {
      NodeUtils.logs.writeError(`${nameToPrint} is currently not supported`);
      console.log(failMessage);
      process.exit(1);
    }

    NodeUtils.logs.writeCheck(`${nameToPrint} detected`);

    return {
      value: maybeFramework,
      manuallyAdded: false,
    };
  } catch (error) {
    spinner.fail("package.json not found");

    if (error instanceof Error && error.message) {
      NodeUtils.logs.writeError(error.message);
    } else {
      console.log(failMessage);
    }

    process.exit(1);
  }
}
