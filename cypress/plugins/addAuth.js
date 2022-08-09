const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");

axios
  .post(
    `https://${process.env.CYPRESS_URL || "prismic.io"}/authentication/signin`,
    {
      email: process.env.EMAIL,
      password: process.env.PASSWORD,
    }
  )
  .then((response) => {
    const cookies = response.headers["set-cookie"].join("; ");
    fs.promises.writeFile(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({
        base: "https://wroom.io/",
        cookies: cookies,
      })
    );
  })
  .catch((e) => console.log(e));
