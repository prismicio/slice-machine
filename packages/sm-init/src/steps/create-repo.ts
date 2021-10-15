import { Communication, Utils } from "slicemachine-core";
import { AxiosError } from "slicemachine-core/src/core/communication";

const DEFAULT_BASE = Utils.CONSTS.DEFAULT_BASE;

export function createRepository(
  domain: string,
  cookies: string,
  framework?: string,
  base = DEFAULT_BASE
): Promise<void> {
  const spinner = Utils.spinner("Creating Prismic Repository");
  spinner.start();

  return Communication.createRepository(domain, cookies, framework, base)
    .then((res) => {
      const addressUrl = new URL(base);
      addressUrl.hostname = `${res.data.domain || domain}.${
        addressUrl.hostname
      }`;
      const address = addressUrl.toString();
      spinner.succeed(`We created your new repository ${address}`);
    })
    .catch((error: AxiosError) => {
      spinner.fail(`Error creating repository ${domain}`);
      if (error.response) {
        console.log(
          `Error: [${error.response.status}]: ${error.response.statusText}`
        );
      }
    });
}
