const fs = require("fs");

const Mustache = require('mustache');
 
const { SUPPORTED_FRAMEWORKS } = require("../common/consts");

const { fetchLibrary } = require("./library");
const { resolve } = require('path');


module.exports = async (req, res) => {
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
      return res.send(400, `Framework "${framework}" is not supported. Please use one of: ${SUPPORTED_FRAMEWORKS}`);
    }

    const scaffolder = require(`../bootstrap/${framework}`);
    const packageName = lib || library || scaffolder.defaultLibrary.packageName;

    if (!packageName) {
      return res.send(400, 'Endpoint expects query parameter "lib" to be defined.\nExample request: `/api/library?lib=my-lib`');
    }

    const smLibrary = await fetchLibrary(packageName);

    const { customTypes, slices, keysToMerge, routes } = require("../common/custom_types/")[projectType](smLibrary.slices);

    const manifest = scaffolder.build(smLibrary, routes);

    const pathToTash = resolve(__dirname, '../', "bootstrap", framework, 'recap.mustache');
    const recapFile = fs.readFileSync(pathToTash, 'utf8');

    return res.json({
      manifest,
      library: smLibrary,
      recap: Mustache.render(recapFile, smLibrary),
      customTypes,
      slices,
      keysToMerge,
    });
  } catch (e) {
    console.error(e);
    res.error(e);
  }
};

