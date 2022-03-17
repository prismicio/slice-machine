import { Communication, NodeUtils } from "@slicemachine/core";
import type { Models } from "@slicemachine/core";

export function createRepository(
  domain: string,
  framework: Models.Frameworks,
  cookies: string,
  base: string
): Promise<string> {
  const spinner = NodeUtils.logs.spinner("Creating Prismic Repository");
  spinner.start();

  return Communication.createRepository(domain, cookies, framework, base)
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
        NodeUtils.logs.writeError(error.message);
      }
      NodeUtils.logs.writeError(
        `We failed to create you new prismic repository`
      );
      console.log(
        `Run ${NodeUtils.logs.bold("npx @slicemachine/init")} again!`
      );
      process.exit(-1);
    });
}
