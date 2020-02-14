const fs = require("fs")
const path = require("path")
const tmp = require("tmp")
const fetch = require("node-fetch")
const AdmZip = require("adm-zip");
const JsZip = require("jszip")
const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);

const {
  libraries,
  defaultLibraries,
  githubRepositories,
  SM_CONFIG_FILE,
  SM_FOLDER_NAME
} = require("../common/consts");

const SM_FILE = 'sm.config.json'

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
  await streamPipeline(
    response.body,
    fs.createWriteStream(tmpZipFile)
  );
  return tmpZipFile
};


async function main(req) {

  try {
    const {
      query: { lib, library, framework = "nuxt" }
    } = req;

    const packageName = lib || library || defaultLibs[framework];

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

    const githubRepository = githubRepositories[packageName]
    if (!githubRepository) {
      return res
        .status(500)
        .send(
          'Unexpected error: We could not find Github repository of given library. This is probably a bug and should be reported!`'
        );
    }

    const tmpZipFile = await download(
      `https://codeload.github.com/${githubRepository}/zip/master`
    );
    const fZip = JsZip();
    const zip = new AdmZip(tmpZipFile);
    const tmpath = tmp.tmpNameSync();

    zip.extractAllTo(tmpath);

    const config = JSON.parse(
      fs.readFileSync(
        path.join(tmpath, `${packageName}-master`, SM_CONFIG_FILE),
        "utf8"
      )
    );

    // const pathToLibrary = path.join(
    //   tmpath,
    //   `${packageName}-master`,
    //   config.pathToLibrary || '.'
    // );

    const relativePathToLib = path.join(
      `${packageName}-master`,
      config.pathToLibrary || "."
    )

    /** Copy library (eg. src) to folder "sliceMachine" */
    zip.getEntries().forEach(function(entry) {
      const entryName = entry.entryName
      if (entryName.indexOf(relativePathToLib) === 0) {
        const relativePath = entryName.split(relativePathToLib).pop()
        if (relativePath !== "/") {
          fZip.file(
            path.join(SM_FOLDER_NAME, relativePath),
            zip.readAsText(entry)
          );
        }
      }
    })

    fZip.file("my-file.txt", "hello you!");
    fZip.generateAsync({ type: "nodebuffer" }).then(function(buffer) {
      fs.writeFileSync("hello.zip", buffer);
    });



  } catch(e) {
    console.error(e)
  }

    
    // const b = zip.toBuffer()

    // fs.writeFileSync('./hello.zip', b)

    // JSZipUtils.getBinaryContent(tmpZipFile, function(err, data) {
    //   if (err) {
    //     console.error(err)
    //   }
    //   console.log('here!', data)

    //   JsZip.loadAsync(data).then(function(zip) {
    //     console.log("oh hello zip", zip);
    //     zip
    //       .generateNodeStream({
    //         type: "nodebuffer",
    //         streamFiles: true
    //       })
    //       .pipe(fs.createWriteStream("res.zip"));
    //   });
    // });
}

main({
  query: {
    lib: 'vue-essential-slices',
    framexwork: 'nuxt'
  }
})
