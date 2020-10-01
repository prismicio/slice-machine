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

const mod = (module.exports = async (req, res) => {
  const {
    query: { lib, library, strip, preserveDefaults }
  } = req;

  const packageName = lib || library;

  if (!packageName) {
    // res.error ?
    return res
      .send(400,
        'Endpoint expects query "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
      );
  }

  const sm = await fetchLibrary(packageName)

  const keysToStrip = handleStripKeys(strip, defaultStripKeys.library, preserveDefaults);

  if (sm) {
    keysToStrip.forEach(key => {
      delete sm[key];
    });
    return res.json(sm);
  }
  // res.error ?
  return res.json(404, {});
});

mod.fetchLibrary = fetchLibrary
