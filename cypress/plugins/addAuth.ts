import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

// File called from the cypress setup in cypress-setup.sh
const [, , EMAIL, PASSWORD, PRISMIC_URL] = process.argv;

const main = async () => {
  console.log({ SM_ENV: process.env.SM_ENV });

  const fetch = (await import("node-fetch")).default;

  const res = await fetch(
    new URL("./authentication/signin", PRISMIC_URL).toString(),
    {
      method: "post",
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    }
  );

  await fs.writeFile(
    path.join(os.homedir(), ".prismic"),
    JSON.stringify({
      base: new URL(PRISMIC_URL).toString(),
      cookies: res.headers.get("Set-Cookie") || "",
    })
  );
};

main();
