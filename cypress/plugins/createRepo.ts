import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import cookie from "cookie";

// File called from the cypress setup in cypress-setup.sh
const [, , DOMAIN_NAME, PASSWORD, PRISMIC_URL] = process.argv;

const main = async () => {
  const fetch = (await import("node-fetch")).default;

  const prismicAuthState = JSON.parse(
    await fs.readFile(path.join(os.homedir(), ".prismic"), "utf8")
  );
  const prismicAuthStateCookies = cookie.parse(prismicAuthState.cookies);

  const deleteURL = new URL("./app/settings/delete", PRISMIC_URL);
  deleteURL.hostname = DOMAIN_NAME + "." + deleteURL.hostname;
  deleteURL.searchParams.set("_", prismicAuthStateCookies.X_XSRF);

  // Delete the repository.
  await fetch(deleteURL.toString(), {
    method: "post",
    body: JSON.stringify({
      config: DOMAIN_NAME,
      password: PASSWORD,
    }),
    headers: {
      "User-Agent": "prismic-cli/0",
    },
  });

  const createURL = new URL("./authentication/newrepository", PRISMIC_URL);
  createURL.searchParams.set("app", "slicemachine");

  // Create the repository.
  await fetch(createURL.toString(), {
    method: "post",
    body: JSON.stringify({
      domain: DOMAIN_NAME,
      framework: "next",
      plan: "personal",
      isAnnual: "false",
      role: "developer",
    }),
    headers: {
      "User-Agent": "prismic-cli/sm",
    },
  });
};

main();
