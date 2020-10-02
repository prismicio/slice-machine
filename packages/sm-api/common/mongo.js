const url = require("url");
const MongoClient = require("mongodb").MongoClient;

let cachedClient = null;

function acquireClient() {
  
  if(cachedClient) return Promise.resolve(cachedClient);
  
  return MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then((db) => {
    cachedClient = db;
    return cachedClient;
  });
}

async function acquireDb() {
  const URI = process.env.MONGODB_URI;
  const databaseName = url.parse(URI).pathname.substr(1);
  const client = await acquireClient();
  return client.db(databaseName);
}

async function queryOnCollection(libraryName, query) {
  const db = await acquireDb();
  const coll = db.collection(libraryName)
  return query(coll);
}

module.exports = {
  client: acquireClient,
  db: acquireDb,
  collections: {
    libraries: (query) => queryOnCollection(Collections.libraries, query),
    errors: (query) => queryOnCollection(Collections.errors, query)
  }
};

const Collections = {
  libraries: 'libraries',
  errors: 'errors'
};
