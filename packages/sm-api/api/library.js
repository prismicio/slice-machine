const connectToDatabase = require("../common/connect");

const handleStripKeys = require("../common").handleStripKeys;

async function fetchLibrary(packageName) {
  const db = await connectToDatabase(process.env.MONGODB_URI)
  const collection = await db.collection("libraries")
  const sm = await collection.findOne({ packageName })
  return sm
}

const mod = module.exports = async (req, res) => {
  const {
    query: { lib, library, strip, preserveDefaults }
  } = req;

  const packageName = lib || library;

  if (!packageName) {
    return res
      .status(400)
      .send(
        'Endpoint expects query "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
      );
  }

  const keysToStrip = handleStripKeys(strip, preserveDefaults);


  const sm = await fetchLibrary(packageName)

  if (sm) {
    keysToStrip.forEach(key => {
      delete sm[key];
    })
    return res.send(sm);
  }
  return res.status(404).send({})
  
};

mod.fetchLibrary = fetchLibrary
