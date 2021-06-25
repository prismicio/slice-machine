const handleStripKeys = require("../common").handleStripKeys;
const cors = require("../common/cors");
const Mongo = require("../common/mongo");

const { defaultStripKeys } = require("../common/consts");

function fetchLibrary(packageName) {
  return Mongo.collections.libraries((coll) => coll.findOne({ packageName }));
}

const mod = (module.exports = cors(async (req, res) => {
  const {
    query: { lib, library, strip, preserveDefaults },
  } = req;

  const packageName = lib || library;

  if (!packageName) {
    return res
      .status(400)
      .send(
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
    return res.send(sm);
  }
  return res.status(404).send({});
}));

mod.fetchLibrary = fetchLibrary;
