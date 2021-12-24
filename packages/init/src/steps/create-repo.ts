import type { Models } from "@slicemachine/core";

import { createRepository as createPrismicRepository } from "@slicemachine/core/build/src/prismic";
import {
  spinner,
  bold,
  writeError,
} from "@slicemachine/core/build/src/internals";

export function createRepository(
  domain: string,
  framework: Models.Frameworks,
  config: Models.PrismicSharedConfig
): Promise<void> {
  const spin = spinner("Creating Prismic Repository");
  spin.start();

  return createPrismicRepository(domain, config.cookies, framework, config.base)
    .then((res) => {
      const addressUrl = new URL(config.base);
      addressUrl.hostname = `${res.data.domain || domain}.${
        addressUrl.hostname
      }`;
      const address = addressUrl.toString();
      spin.succeed(`We created your new repository ${address}`);
    })
    .catch((error: Error) => {
      spin.fail(`Error creating repository ${domain}`);
      if (error.message) {
        writeError(error.message);
      }
      writeError(`We failed to create you new prismic repository`);
      console.log(`Run ${bold("npx slicemachine init")} again!`);
      process.exit(-1);
    });
}
