import { Utils } from "slicemachine-core";
import * as inquirer from "inquirer";

export async function promptForFramework(): Promise<Utils.Framework> {
  const frameworks = Utils.framework.SupportedFrameworks;
  const choices = frameworks.map((framework) => {
    return {
      name: Utils.framework.fancyName(framework),
      value: framework,
    };
  });

  return inquirer
    .prompt<{ framework: Utils.Framework }>([
      {
        name: "framework",
        type: "list",
        message: "Select a framework to use",
        required: true,
        choices,
      },
    ])
    .then((res) => res.framework);
}

export async function detectFramework(cwd: string): Promise<Utils.Framework> {
  const failMessage = `Please run ${Utils.bold(
    "npx slicemachine init"
  )} in a Nuxt or Next.js project`;

  const spinner = Utils.spinner(
    "Detecting framework to install correct dependencies"
  );

  spinner.start();

  try {
    const maybeFramewrok = Utils.framework.detectFramework(cwd);

    if (!maybeFramewrok || maybeFramewrok === Utils.Framework.vanillajs) {
      spinner.fail("Framework not detected");
      return await promptForFramework();
    }

    const nameToPrint = Utils.framework.fancyName(maybeFramewrok);
    spinner.succeed(`${nameToPrint} detected`);

    return maybeFramewrok;
  } catch {
    spinner.fail("package.json not found");
    Utils.writeError(failMessage);
    process.exit(1);
  }
}
