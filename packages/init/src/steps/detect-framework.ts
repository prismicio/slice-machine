import { Models } from "@slicemachine/core";
import * as inquirer from "inquirer";

import { isUnsupported } from "@slicemachine/core/build/src/utils";
import { detectFramework as detectMaybeFramework } from "@slicemachine/core/build/src/fs-utils";
import {
  spinner,
  bold,
  writeError,
  writeCheck,
} from "@slicemachine/core/build/src/internals";

export type FrameworkResult = {
  value: Models.Frameworks;
  manuallyAdded: boolean;
};

function capitaliseFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function fancyName(str: Models.Frameworks): string {
  switch (str) {
    case Models.Frameworks.next:
      return "Next.js";
    default:
      return capitaliseFirstLetter(str);
  }
}

export async function promptForFramework(): Promise<FrameworkResult> {
  const choices = Models.SupportedFrameworks.map((framework) => {
    return {
      name: fancyName(framework),
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
  const failMessage = `Please run ${bold(
    "npx slicemachine init"
  )} in a Nuxt or Next.js project`;

  const spin = spinner("Detecting framework to install correct dependencies");

  spin.start();

  try {
    const maybeFramework = detectMaybeFramework(
      cwd,
      Object.values(Models.Frameworks)
    );
    spin.stop();

    if (!maybeFramework || maybeFramework === Models.Frameworks.vanillajs) {
      writeError("Framework not detected");
      return await promptForFramework();
    }

    const nameToPrint = fancyName(maybeFramework);

    if (isUnsupported(maybeFramework)) {
      writeError(`${nameToPrint} is currently not supported`);
      console.log(failMessage);
      process.exit(1);
    }

    writeCheck(`${nameToPrint} detected`);

    return {
      value: maybeFramework,
      manuallyAdded: false,
    };
  } catch (error) {
    spin.fail("package.json not found");

    if (error instanceof Error && error.message) {
      writeError(error.message);
    } else {
      console.log(failMessage);
    }

    process.exit(1);
  }
}
