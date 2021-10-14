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
  const spinner = Utils.spinner("Detecting framework");
  return maybeDetect(cwd)
    .catch(() => "") // or some other framework that's not supported
    .then((framework) => {
      if (!framework) {
        spinner.fail("Framework not detected");
        throw new Error("frame work not-found");
      }
      if (
        Utils.framework.SupportedFrameworks.includes(
          framework as Utils.Framework
        )
      ) {
        spinner.succeed(`Found: ${framework}`);
        return framework;
      }
      spinner.fail(`Framework ${framework} is not supported`);
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
