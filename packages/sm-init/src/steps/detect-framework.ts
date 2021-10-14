import { Utils } from "slicemachine-core";

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

export function detectFramework(cwd: string): Promise<string> {
  const spinner = Utils.spinner(
    "Detecting framework to install correct dependencies"
  );
  return maybeDetect(cwd)
    .catch(() => {
      spinner.fail("Framework not detected");
      throw new Error("frame work not-found");
    })
    .then((framework) => {
      const nameToPrint = Utils.framework.fancyName(framework);
      if (Utils.framework.SupportedFrameworks.includes(framework)) {
        spinner.succeed(`${nameToPrint} detected`);
        return framework;
      }
      spinner.fail(`Framework: ${nameToPrint} is not supported`);
      throw new Error(framework);
    })
    .catch(() => {
      console.log(
        `Please run ${Utils.bold(
          "npx slicemachine init"
        )} in a Nuxt or Next.js project`
      );
      process.exit(1);
    });
}
