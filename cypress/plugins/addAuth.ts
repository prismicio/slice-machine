import fs from "fs";
import os from "os";
import path from "path";
import axios from "axios";

// File called from the cypress setup in cypress-setup.sh
const [, , EMAIL, PASSWORD, PRISMIC_URL] = process.argv;

axios
  .post(`${PRISMIC_URL}/authentication/signin`, {
    email: EMAIL,
    password: PASSWORD,
  })
  .then((response) => {
    const cookies = response.headers["set-cookie"].join("; ");
    fs.promises.writeFile(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({
        base: `${PRISMIC_URL}/`,
        cookies: cookies,
      })
    );
  })
  .catch((e) => {
    console.error("[AUTH]: ", e.message);
    console.error(e);
  });
