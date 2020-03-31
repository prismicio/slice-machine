const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const fetch = require("node-fetch");
const AdmZip = require("adm-zip");
const JsZip = require("jszip");
const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);
const cors = require("../common/cors");

const {
  libraries,
  defaultLibraries,
  githubRepositories,
  SM_CONFIG_FILE,
  SM_FOLDER_NAME
} = require("../common/consts");

const fetchLibrary = require("./library").fetchLibrary;
const mergeCts = require("../common").mergeCustomTypesWithSlices;

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
      query: { lib, library, projectType = "landing", framework = "nuxt" }
    } = req;

    const packageName = lib || library || defaultLibraries[framework];

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
          'Invalid query parameter "lib": library does not exist or is not a Slice Machine library.`'
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

    // const config = JSON.parse(
    //   fs.readFileSync(
    //     path.join(tmpath, `${packageName}-master`, SM_CONFIG_FILE),
    //     "utf8"
    //   )
    // );

    // const pathToLibrary = path.join(
    //   tmpath,
    //   `${packageName}-master`,
    //   config.pathToLibrary || '.'
    // );

    // const relativePathToLib = path.join(
    //   `${packageName}-master`,
    //   config.pathToLibrary || "."
    // );

    /** Copy library (eg. src) to folder "sliceMachine" */
    // zip.getEntries().forEach(function(entry) {
    //   const entryName = entry.entryName;
    //   if (entryName.indexOf(relativePathToLib) === 0) {
    //     const relativePath = entryName.split(relativePathToLib).pop();
    //     if (relativePath !== "/") {
    //       fZip.file(
    //         path.join(SM_FOLDER_NAME, relativePath),
    //         zip.readAsText(entry)
    //       );
    //     }
    //   }
    // });

    const smLibrary = await fetchLibrary(packageName);

    await (async function handleCustomTypes(){

      // protect this
      const {
        cts,
        toBeMerged,
        files,
      } = require("../bootstrap/custom_types/")[projectType]();

      const mergedCustomTypes = mergeCts([...cts], smLibrary.slices, toBeMerged);

      fZip.file("mergedCustomTypes.json", JSON.stringify(mergedCustomTypes));

      /** Bug: files seem to be overwritten by mergeCts.
       *  Here, they contain a non-empty "choices" value */
      Object.entries(files).map(([fileName, content]) => {
        fZip.file(`custom_types/${fileName}`, JSON.stringify(content));
      })
    })();

    (function handleScaffolder(){
      const Scaffolder = require(`../bootstrap/${framework}`);
      const scaffolder = Scaffolder({ packageName, ...smLibrary, isBootstrap: true });
      scaffolder.files.forEach(({ name, f }) => fZip.file(name, f))
      const manifest = {
        ...scaffolder.manifest,
        devDependencies: [
          ...scaffolder.manifest.devDependencies,
          ...smLibrary.devDependencies
        ],
        dependencies: [
          ...scaffolder.manifest.dependencies,
          ...smLibrary.dependencies,
          packageName /** IMPORTANT */
        ],
        libraries: (scaffolder.manifest.libraries || []).concat([packageName]),
        css: smLibrary.css || [],
        script: smLibrary.script || []
      };
      fZip.file("manifest.json", JSON.stringify(manifest));
    })();

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

