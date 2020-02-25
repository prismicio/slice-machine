const connectToDatabase = require('../common/connect')

const handleStripKeys = require("../common").handleStripKeys;

module.exports = async (req, res) => {
  const {
    query: { framework, strip, preserveDefaults }
  } = req;

  const keysToStrip = handleStripKeys(strip, preserveDefaults);

  const db = await connectToDatabase(process.env.MONGODB_URI)
  const collection = await db.collection("libraries")
  const libraries = await collection.find({
    ...(framework ? { framework } : {})
  }).toArray()

  libraries.forEach((library) => {
    keysToStrip.forEach((key) => {
      delete library[key]
    })
  })
  res.send(libraries)
}