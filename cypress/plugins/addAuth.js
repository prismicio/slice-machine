const fs = require("fs");
const os = require("os");
const path = require("path");
const axios = require("axios");

axios
  .post("https://prismic.io/authentication/signin", {
    email: "lorenzo.sintini@gmail.com",
    password: "123456",
  })
  .then((response) => {
    const cookies = response.headers["set-cookie"].join("; ");
    fs.promises.writeFile(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({
        base: "https://prismic.io/",
        cookies: cookies,
      })
    );
  })
  .catch((e) => console.log(e));
