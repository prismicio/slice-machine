import { Communication, Utils } from "@slicemachine/core";
import type { Models } from "@slicemachine/core";

export function createRepository(
  domain: string,
  framework: Models.Frameworks,
  config: Models.PrismicSharedConfig
): Promise<void> {
  const spinner = Utils.spinner("Creating Prismic Repository");
  spinner.start();

  return Communication.createRepository(
    domain,
    config.cookies,
    framework,
    config.base
  )
    .then((res) => {
      const addressUrl = new URL(config.base);
      addressUrl.hostname = `${res.data.domain || domain}.${
        addressUrl.hostname
      }`;
      const address = addressUrl.toString();
      spinner.succeed(`We created your new repository ${address}`);
    })
    .catch((error: Error) => {
      spinner.fail(`Error creating repository ${domain}`);
      if (error.message) {
        Utils.writeError(error.message);
      }
      Utils.writeError(`We failed to create you new prismic repository`);
      console.log(`Run ${Utils.bold("npx @slicemachine/init")} again!`);
      process.exit(-1);
    });
}
