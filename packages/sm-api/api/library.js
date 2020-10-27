const fetch = require("node-fetch");
const handleStripKeys = require("../common").handleStripKeys;
const expectLibrary = require("sm-commons/expect").expectLibrary;

const { parsePackagePathname } = require('../common/package')

const {
  SM_FILE,
  REGISTRY_URL,
  defaultStripKeys,
} = require('../common/consts')

async function fetchJson(url) {
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`[api/job] Unable to fetch "${url}"`);
  }
  return await response.json();
}

async function fetchLibrary(packageName, expect = true) {
  const { packageSpec } = parsePackagePathname(packageName);
  const packageSmUrl = `${REGISTRY_URL}${packageSpec}/${SM_FILE}`;

  const sm = await fetchJson(packageSmUrl);

  if (expect) {
    expectLibrary(sm);
  }
  return sm
}

const mod = (module.exports = async (event) => {
  const { lib, library, strip, preserveDefaults } = event.queryStringParameters || {};

  const packageName = lib || library;

  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET','Content-Type': 'application/json'};

  if (!packageName) {

    const message = 'Endpoint expects query "lib" to be defined.\nExample request: `/api/library?lib=my-lib`';

    return { statusCode: 400, headers, body: JSON.stringify({ error: true, message })}
  }

  const sm = await fetchLibrary(packageName)

  const keysToStrip = handleStripKeys(strip, defaultStripKeys.library, preserveDefaults);

  if (sm) {
    keysToStrip.forEach(key => {
      delete sm[key];
    });

    return { statusCode: 200, headers, body: JSON.stringify(sm)}
  }
  
  const message = `${packageName} : not found`;
  return { statusCode: 404, headers, body: JSON.stringify({ error: true, message }) };
});

mod.fetchLibrary = fetchLibrary
