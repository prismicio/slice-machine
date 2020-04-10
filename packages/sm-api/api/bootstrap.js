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

const { libraries, githubRepositories } = require("../common/consts");

const mergeManifests = require("../common/manifest").merge

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
    const packageName = lib || library || scaffolder.defaultLibrary;

    if (!packageName) {
      return res
        .status(400)
        .send(
          'Endpoint expects query parameter "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
        );
    }

    if (!libraries[packageName]) {
      return res
        .status(400)
        .send(
          'Invalid query parameter "library": library does not exist or is not a Slice Machine library.`'
        );
    }

    const githubRepository = githubRepositories[packageName];
    if (!githubRepository) {
      return res
        .status(500)
        .send(
          "Unexpected error: We could not find the Git repository of given library. This is probably a bug and should be reported!`"
        );
    }

    const tmpZipFile = await download(
      `https://codeload.github.com/${githubRepository}/zip/master`
    );
    const fZip = JsZip();
    const zip = new AdmZip(tmpZipFile);
    const tmpath = tmp.tmpNameSync();

    zip.extractAllTo(tmpath);

    const smLibrary = await fetchLibrary(packageName);

    const { cts: mergedCustomTypes, files } = require("../common/custom_types/")[projectType](smLibrary.slices);

    fZip.file("mergedCustomTypes.json", JSON.stringify(mergedCustomTypes));

    Object.entries(files).map(([fileName, content]) => {
      fZip.file(`custom_types/${fileName}`, JSON.stringify(content));
    })

    const manifest = mergeManifests(scaffolder, smLibrary);
    const recapFile = require(`../bootstrap/${framework}/recap.mustache`)
    fZip.file(
      "boot.json",
      JSON.stringify({
        manifest,
        library: smLibrary,
        recap: Mustache.render(recapFile, smLibrary)
      })
    )

    fZip
      .generateNodeStream({
        type: "nodebuffer",
        streamFiles: true
      })
      .pipe(res);
  } catch (e) {
    console.error(e);
  }
});

