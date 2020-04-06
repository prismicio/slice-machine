const url = require("url");
const MongoClient = require("mongodb").MongoClient;

const URI = process.env.MONGODB_URI;
const databaseName = url.parse(URI).pathname.substr(1);

function opCollection(libraryName) {
  const client = await acquireClient();
  const db = client.db(databaseName);
  const coll = db.collection(libraryName)
  return query(coll);
}

function acquireClient() {
  return cachedClient || (() => {
    const c = MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    cachedClient = c;
    return c;
  })();
}

async function acquireDb() {
  const client = await acquireClient();
  return client.db(databaseName);
}

export default {
  client: acquireClient,
  db: acquireDb,
  collections: {
    libraries: (query) => opCollection(Collections.libraries)(query),
    errors: (query) => opCollection(Collections.errors)(query)
  }
};

const Collections = {
  libraries: 'libraries',
  errors: 'errors'
};
