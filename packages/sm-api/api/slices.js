const fs = require('fs');
const request = require("request");
const tmp = require('tmp');
const connectToDatabase = require("../common/connect");

const fetchLibrary = require('./library').fetchLibrary

const defaultLibs = {
    'nuxt': 'vue-essential-slices',
    'next': '...'
}

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
      .on(e => reject(e.message));
  });
};

module.exports = async (req, res) => {
  const {
    query: { lib, library, framework = 'nuxt' }
  } = req;

  const packageName = lib || library || defaultLibs[framework];

  if (!packageName) {
    return res
      .status(400)
      .send(
        'Endpoint expects query parameter "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
      );
  }

  const sm = await fetchLibrary(packageName);

  console.log('sm', sm)

  // const tmpZipFile = await download("https://codeload.github.com/prismicio/vue-essential-slices/zip/master")

//   const db = await connectToDatabase(process.env.MONGODB_URI);
//   const collection = await db.collection("libraries");
//   const sm = await collection.findOne({ packageName });

  res.send(sm.slices);
};
