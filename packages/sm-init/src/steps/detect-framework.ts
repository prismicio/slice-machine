import { Utils } from "slicemachine-core";
import * as inquirer from "inquirer";

export function maybeDetect(cwd: string): Promise<Utils.Framework> {
  return new Promise((resolve, reject) => {
    try {
      const result = Utils.framework.detectFramework(cwd);
      return resolve(result);
    } catch (e) {
      return reject(e);
    }
  });
}

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

export async function detectFramework(cwd: string): Promise<string> {
  const failMessage = `Please run ${Utils.bold(
    "npx slicemachine init"
  )} in a Nuxt or Next.js project`;
  const spinner = Utils.spinner(
    "Detecting framework to install correct dependencies"
  );

  spinner.start();

  return maybeDetect(cwd)
    .catch((error: Error) => {
      spinner.fail("package.json not found");

      Utils.writeError(error.message || failMessage);

      return process.exit(1);
    })
    .then((framework) => {
      if (!framework || framework === Utils.Framework.vanillajs) {
        spinner.fail("Framework not detected");
        return promptForFramework();
      }

      const nameToPrint = Utils.framework.fancyName(framework);
      spinner.succeed(`${nameToPrint} detected`);

      return framework;
    });
}
