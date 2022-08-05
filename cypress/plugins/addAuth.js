const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");

axios
  .post("https://wroom.io/authentication/signin", {
    email: "cypress@prismic.io",
    password: "AhK9yohhie9ahyohn3w",
  })
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
