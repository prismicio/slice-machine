const handleStripKeys = require("../common").handleStripKeys;
const { defaultStripKeys } = require('../common/consts');
const cors = require("../common/cors");
const Mongo = require('../common/mongo');

module.exports = cors(async (req, res) => {
  const {
    query: { framework, strip, preserveDefaults }
  } = req;

  const keysToStrip = handleStripKeys(strip, defaultStripKeys.library, preserveDefaults);
  const libraries = await Mongo.collections.libraries(coll => {
    coll.find({
      ...(framework ? { framework } : {})
    }).toArray()
  })

  libraries.forEach((library) => {
    keysToStrip.forEach((key) => {
      delete library[key]
    })
  })
  res.send(libraries)
});
