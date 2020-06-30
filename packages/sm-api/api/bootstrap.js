const fs = require("fs");
const tmp = require("tmp");
const fetch = require("node-fetch");
const AdmZip = require("adm-zip");
const JsZip = require("jszip");
const util = require("util");

const Mustache = require('mustache');
const streamPipeline = util.promisify(require("stream").pipeline);

const cors = require("../common/cors");

const { SUPPORTED_FRAMEWORKS } = require("../common/consts");

const { libraries } = require("../common/consts");

const { fetchLibrary } = require("./library");

require.extensions['.mustache'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

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
  const response = await fetch(url.href);
  await streamPipeline(response.body, fs.createWriteStream(tmpZipFile));
  return tmpZipFile;
}

module.exports = cors(async (req, res) => {
  try {
    const {
      query: {
        lib,
        library,
        framework = "nuxt",
        projectType = "landing",
      }
    } = req;

    if (SUPPORTED_FRAMEWORKS.indexOf(framework) === -1) {
      return res
        .status(400)
        .send(
          `Framework "${framework}" is not supported. Please use one of: ${SUPPORTED_FRAMEWORKS}`
        );
    }

    const scaffolder = require(`../bootstrap/${framework}`);
    const packageName = lib || library || scaffolder.defaultLibrary.packageName;

    if (!packageName) {
      return res
        .status(400)
        .send(
          'Endpoint expects query parameter "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
        );
    }

    const smLibrary = await fetchLibrary(packageName);

    const { customTypes, slices, keysToMerge, routes } = require("../common/custom_types/")[projectType](smLibrary.slices);

    const manifest = scaffolder.build(smLibrary, routes);
    const recapFile = require(`../bootstrap/${framework}/recap.mustache`)

    return res.send(JSON.stringify({
      manifest,
      library: smLibrary,
      recap: Mustache.render(recapFile, smLibrary),
      customTypes,
      slices,
      keysToMerge,
    }))
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: e })
  }
});

