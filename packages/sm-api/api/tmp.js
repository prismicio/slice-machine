const fs = require("fs")
const tmp = require("tmp")
const request = require("request")
const JSZip = require("jszip");

function handleUrl(endpoint, params = {}) {
  const url = new URL(endpoint);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  );
  return url;
}

async function download(endpoint, params) {
  const url = handleUrl(endpoint, params);
  const tmpZipFile = tmp.tmpNameSync();
  return new Promise((resolve, reject) => {
    request(url.href)
      .on("response", response => {
        response
          .pipe(fs.createWriteStream(tmpZipFile))
          .on("error", ({ message }) => {
            reject(message);
          })
          .on("finish", () => resolve(tmpZipFile));
      })
      .on("error", e => reject(e.message));
  });
};

module.exports = async (req, res) => {
    const tmpZipFile = await download(
      "https://codeload.github.com/prismicio/vue-essential-slices/zip/master"
    );

    const zip = JSZip(tmpZipFile);

    res.statusCode = 200;
    res.setHeader("Content-disposition", "attachment; filename=slices.zip");
    return zip
      .generateNodeStream({
        type: "nodebuffer",
        streamFiles: true
      })
      .pipe(res);
}