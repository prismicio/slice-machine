// Import Dependencies
const url = require('url')
const MongoClient = require('mongodb').MongoClient

let cachedDb = null

async function connectToDatabase(uri) {
  if (cachedDb) {
    return cachedDb
  }

  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  // Select the database through the connection,
  // using the database path of the connection string
  const db = await client.db(url.parse(uri).pathname.substr(1))
  cachedDb = db
  return db
}

// The main, exported, function of the endpoint,
// dealing with the request and subsequent response
module.exports = async (req, res) => {

    const db = await connectToDatabase(process.env.MONGODB_URI)

    const collection = await db.collection('users')

    const users = await collection.find({}).toArray()

    console.log('userrs',users)
    // Respond with a JSON string of all users in the collection
    // res.status(200).json({ users })
    res.send(200)
}