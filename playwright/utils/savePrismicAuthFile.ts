import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

import config from "../playwright.config";

export async function savePrismicAuthFile(userApiToken: string) {
  console.log("Saving Prismic auth file", userApiToken);
  const prismicFilePath = path.join(os.homedir(), ".prismic");
  await fs.writeFile(
    prismicFilePath,
    JSON.stringify({
      base: config.use.baseURL,
      cookies: `prismic-auth=${userApiToken}; Path=/; SameSite=None; SESSION=fake_session`,
    }),
  );
}
