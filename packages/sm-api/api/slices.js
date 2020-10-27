const fetchLibrary = require('./library').fetchLibrary

module.exports = async (event) => {
  const { lib, library, framework = 'nuxt'} = event.queryStringParameters || {};
  
  const defaultLibrary = require(`../bootstrap/${framework}`).defaultLibrary;
  const packageName = lib || library || defaultLibrary.packageName;

  const headers =  { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET','Content-Type': 'application/json'};

  if (!packageName) {
    // res.error ?
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'missing parameter',
        message: 'Endpoint expects query parameter "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
      }),
    };
  }

  const sm = await fetchLibrary(packageName);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(sm.slices),
  };
};

