const { version } = require('../package.json');
const deprecatedUnder = "0.0.14";

module.exports = async () => {
  const body = JSON.stringify({ current: version, deprecatedUnder });
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Content-Type': 'application/json'
    },
    body,
  };
}
