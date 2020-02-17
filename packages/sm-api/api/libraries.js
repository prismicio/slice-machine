const connectToDatabase = require('../common/connect')

module.exports = async (req, res) => {
  const { query: { framework } } = req
  const db = await connectToDatabase(process.env.MONGODB_URI)
  const collection = await db.collection("libraries")
  const libraries = await collection.find({
    ...(framework ? { framework } : {})
  }).toArray()
  res.send(libraries)
}