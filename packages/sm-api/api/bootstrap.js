const fs = require("fs");

const Mustache = require('mustache');
 
const { SUPPORTED_FRAMEWORKS } = require("../common/consts");

const { fetchLibrary } = require("./library");
const { resolve } = require('path');


module.exports = async (event) => {
  
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET','Content-Type': 'application/json'};

  try {
    const {
      queryStringParameters: {
        lib,
        library,
        framework = "nuxt",
        projectType = "landing",
      } = {},
    } = event;

    if (SUPPORTED_FRAMEWORKS.indexOf(framework) === -1) {
      const message = `Framework "${framework}" is not supported. Please use one of: ${SUPPORTED_FRAMEWORKS}`;
      return { statusCode: 400, headers, body: JSON.stringify({ error: true, message }) };
    }

    const scaffolder = require(`../bootstrap/${framework}`);
    const packageName = lib || library || scaffolder.defaultLibrary.packageName;

    if (!packageName) {
      const message = 'Endpoint expects query parameter "lib" to be defined.\nExample request: `/api/library?lib=my-lib`';
      return { statusCode: 400, headers, body: JSON.stringify({ error: true, message }) }
    }

    const smLibrary = await fetchLibrary(packageName);

    const { customTypes, slices, keysToMerge, routes } = require("../common/custom_types/")[projectType](smLibrary.slices);

    const manifest = scaffolder.build(smLibrary, routes);

    const pathToTash = resolve(__dirname, '../', "bootstrap", framework, 'recap.mustache');
    const recapFile = fs.readFileSync(pathToTash, 'utf8');

    const body = JSON.stringify({
      manifest,
      library: smLibrary,
      recap: Mustache.render(recapFile, smLibrary),
      customTypes,
      slices,
      keysToMerge,
    })

    return { statusCode: 200, headers, body };
  } catch (e) {
    console.error(e);

    return { statusCode: 500, headers, body: JSON.stringify({ error: true, message: e.message }) }
  }
};

