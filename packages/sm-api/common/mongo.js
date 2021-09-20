const url = require("url");
const MongoClient = require("mongodb").MongoClient;

const URI = process.env.MONGODB_URI;
const databaseName = url.parse(URI).pathname.substr(1);
let cachedClient;

function acquireClient() {
  return (
    cachedClient ||
    (() => {
      const c = MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      cachedClient = c;
      return c;
    })()
  );
}

async function acquireDb() {
  const client = await acquireClient();
  return client.db(databaseName);
}

async function queryOnCollection(libraryName, query) {
  const db = await acquireDb();
  const coll = db.collection(libraryName);
  return query(coll);
}

module.exports = {
  client: acquireClient,
  db: acquireDb,
  collections: {
    libraries: (query) => queryOnCollection(Collections.libraries, query),
    errors: (query) => queryOnCollection(Collections.errors, query),
  },
};

const Collections = {
  libraries: "libraries",
  errors: "errors",
};
