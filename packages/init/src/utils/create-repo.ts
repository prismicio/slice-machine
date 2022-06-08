import type { Models } from "@slicemachine/core";
import * as logs from "./logs";
import { Client } from "./client";

export function createRepository(
  domain: string,
  framework: Models.Frameworks
): Promise<string> {
  const spinner = logs.spinner("Creating Prismic Repository");
  spinner.start();

  return Client.createRepository(domain, framework)
    .then((domain: string) => {
      const addressUrl = new URL(Client.get().apisEndpoints.Wroom);
      addressUrl.hostname = `${domain}.${addressUrl.hostname}`;
      const address = addressUrl.toString();
      spinner.succeed(`We created your new repository ${address}`);

      return domain;
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
