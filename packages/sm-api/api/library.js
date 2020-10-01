const handleStripKeys = require("../common").handleStripKeys;
const Mongo = require("../common/mongo");

const { defaultStripKeys } = require("../common/consts");

function fetchLibrary(packageName) {
  return Mongo.collections.libraries((coll) => coll.findOne({ packageName }));
}

const mod = (module.exports = async (req, res) => {
  const {
    query: { lib, library, strip, preserveDefaults },
  } = req;

  const packageName = lib || library;

  if (!packageName) {
    // res.error ?
    return res
      .send(400,
        'Endpoint expects query "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
      );
  }

  const keysToStrip = handleStripKeys(
    strip,
    defaultStripKeys.library,
    preserveDefaults
  );

  const sm = await fetchLibrary(packageName);

  if (sm) {
    keysToStrip.forEach((key) => {
      delete sm[key];
    });
    return res.json(sm);
  }
  // res.error ?
  return res.json(404, {});
});

mod.fetchLibrary = fetchLibrary;
