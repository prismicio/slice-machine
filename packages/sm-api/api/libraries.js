const connectToDatabase = require('../common/connect')

module.exports = async (_, res) => {
  const db = await connectToDatabase(process.env.MONGODB_URI)
  const collection = await db.collection("libraries");
  const libraries = await collection.find({}).toArray();
  res.send(libraries)
}