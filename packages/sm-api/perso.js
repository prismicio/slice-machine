// Import Dependencies
const url = require('url')
const MongoClient = require('mongodb').MongoClient

// Create cached connection variable
let cachedDb = null

// A function for connecting to MongoDB,
// taking a single parameter of the connection string
async function connectToDatabase(uri) {
    // If the database connection is cached,
    // use it instead of creating a new connection
    if (cachedDb) {
        return cachedDb
    }

    // If no connection is cached, create a new one
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

    // Select the database through the connection,
    // using the database path of the connection string
    const db = await client.db(url.parse(uri).pathname.substr(1))

    // Cache the database connection and return the connection
    cachedDb = db
    return db
}

async function main() {
    const db = await connectToDatabase("mongodb+srv://hypervillain:YDJppGOw6B5sNJlY@cluster0-vrtol.mongodb.net/test?retryWrites=true&w=majority")

    const collection = await db.collection("libraries");

    const libs = await collection.find({}).toArray();

    console.log('libs', libs)

    const sm = {
      packageName: 'my-unique-awesome-package',
      data: {
        t: false
      }
    }

    await collection.deleteOne({ packageName: "my-unique-awesome-package" });
    // const a = await collection.updateOne({ packageName: sm.packageName }, { $set: sm }, {
    //   upsert: true
    // });
}

main()