const fetch = require("node-fetch");
const connectToDatabase = require("../../common/connect");

const {
  libraries,
  MONGO_LIBRARIES_COLLECTION,
  REGISTRY_URL,
  SM_FILE
} = require("../../common/consts");

const fetchLibrary = require("../library").fetchLibrary;

const {
  parsePackagePathname
} = require('./package')

async function fetchJson(url) {
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`[api/job] Unable to fetch "${url}"`);
  }
  return await response.json();
}

module.exports = async (req, res) => {
  const npmPackages = Object.keys(libraries);
  npmPackages.forEach(async packageName => {
    try {
      const { packageSpec } = parsePackagePathname(packageName);
      const packageSmUrl = `${REGISTRY_URL}${packageSpec}/${SM_FILE}`;

      const sm = await fetchJson(packageSmUrl);
      
      const db = await connectToDatabase(process.env.MONGODB_URI);
      const collection = await db.collection(MONGO_LIBRARIES_COLLECTION);

      await collection.updateOne(
        { packageName: packageName },
        { $set: sm },
        {
          upsert: true
        }
      );
      return res.status(200).send('');
    } catch(e) {
      console.error(e)
      return res.status(500).send(e)
    }
  });
};
