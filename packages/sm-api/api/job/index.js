const fetch = require("node-fetch");
const expectLibrary = require("sm-commons/expect").expectLibrary;
const connectToDatabase = require("../../common/connect");

const {
  libraries,
  MONGO_ERRORS_COLLECTION,
  MONGO_LIBRARIES_COLLECTION,
  REGISTRY_URL,
  SM_FILE
} = require("../../common/consts");

const postMessage = require("./slack").postMessage;

const { parsePackagePathname } = require('./package')

async function fetchJson(url) {
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`[api/job] Unable to fetch "${url}"`);
  }
  return await response.json();
}

module.exports = async (_, res) => {
  const npmPackages = Object.keys(libraries);
  npmPackages.forEach(async packageName => {
    const db = await connectToDatabase(process.env.MONGODB_URI);
    try {
      const { packageSpec } = parsePackagePathname(packageName);
      const packageSmUrl = `${REGISTRY_URL}${packageSpec}/${SM_FILE}`;

      const sm = await fetchJson(packageSmUrl);
      
      expectLibrary(sm);
      throw new Error('hey!')
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
      const collection = await db.collection(MONGO_ERRORS_COLLECTION);
      const latest = await collection.findOne({ packageName });
      const err = `An error occured while fetching package definition "${packageName}".\n\n[Full error] ${e}`;
      if (latest && latest.last_updated) {
        const diff =
          new Date().getTime() - new Date(latest.last_updated).getTime();

        const every = 60000 * 20;

        if (diff < every) {
          return res.status(500).send(err);
        }
        
      }
      await postMessage(err);
      await collection.updateOne(
        { packageName },
        { $set: { packageName, last_updated: new Date(), err } },
        {
          upsert: true
        }
      );
      return res.status(500).send(err);
    }
  });
};
