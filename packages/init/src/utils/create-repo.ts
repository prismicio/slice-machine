import type { Models } from "@slicemachine/core";
import * as logs from "./logs";
import * as Prismic from "@slicemachine/core/build/prismic";

export function createRepository(
  domain: string,
  framework: Models.Frameworks,
  cookies: string,
  base: string
): Promise<string> {
  const spinner = logs.spinner("Creating Prismic Repository");
  spinner.start();

  return Prismic.Communication.createRepository(
    domain,
    cookies,
    framework,
    base
  )
    .then((res) => {
      const addressUrl = new URL(base);
      const repoDomainName = res.data.domain || domain;
      addressUrl.hostname = `${repoDomainName}.${addressUrl.hostname}`;
      const address = addressUrl.toString();
      spinner.succeed(`We created your new repository ${address}`);

      return repoDomainName;
    })
    .catch((error: Error) => {
      spinner.fail(`Error creating repository ${domain}`);
      if (error.message) {
        logs.writeError(error.message);
      }
      logs.writeError(`We failed to create you new prismic repository`);
      console.log(`Run ${logs.bold("npx @slicemachine/init")} again!`);
      process.exit(-1);
    });
}
