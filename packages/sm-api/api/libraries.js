const Mongo = require('../common/mongo');
const handleStripKeys = require("../common").handleStripKeys;
const { defaultStripKeys } = require('../common/consts');
 
async function fetchLibraries({ framework, list }) { 
  const search = {
    ...(framework ? {
      framework
    } : null),
    ...(list ? {
      packageName: {
        '$in': list.trim().split(',')
      }
    } : null)
  }
  const cursor = await Mongo.collections.libraries(coll => (
    coll.find(search)
  ));
  return await cursor.toArray()
}

module.exports = async (event) => {
  const {
    queryStringParameters: {
      framework,
      strip,
      list,
      preserveDefaults
    } = {},
  } = event;

  const keysToStrip = handleStripKeys(strip, defaultStripKeys.library, preserveDefaults);

  const libraries = await fetchLibraries({
    framework,
    list
  })

  libraries.forEach((library) => {
    keysToStrip.forEach((key) => {
      delete library[key]
    })
  })
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET','Content-Type': 'application/json'};

  return { statusCode: 200, headers, body: JSON.stringify(libraries) };

};

module.exports.fetchLibraries = fetchLibraries;
