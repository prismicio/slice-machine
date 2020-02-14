const connectToDatabase = require("../common/connect");

async function fetchLibrary(packageName) {
  const db = await connectToDatabase(process.env.MONGODB_URI)
  const collection = await db.collection("libraries")
  const sm = await collection.findOne({ packageName })
  return sm
}

const mod = module.exports = async (req, res) => {
  const { query: { lib, library } } = req

  const packageName = lib || library;

  if (!packageName) {
    return res
      .status(400)
      .send(
        'Endpoint expects query "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
      );
  }

  const sm = await fetchLibrary(packageName)

  res.send(sm);
};

mod.fetchLibrary = fetchLibrary
