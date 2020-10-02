const handleStripKeys = require("../common").handleStripKeys;
const {
  defaultStripKeys,
  SUPPORTED_FRAMEWORKS
} = require("../common/consts");

module.exports = async (event) => {
  const {
    queryStringParameters: {
      strip,
      preserveDefaults
    } = {},
  } = event;

  const keysToStrip = handleStripKeys(strip, defaultStripKeys.framework, preserveDefaults);

  const frameworks = SUPPORTED_FRAMEWORKS.map(async (framework) => ({
    scaffolder: require(`../bootstrap/${framework}`),
    framework
  }))

  const resolved = (await Promise.all(frameworks))
    .map(({ scaffolder, framework }) => ({ manifest: scaffolder.build(), framework }))
  resolved.forEach((framework) => {
    keysToStrip.forEach((key) => {
      delete framework[key]
    })
  })

  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET','Content-Type': 'application/json'};

  return { statusCode: 200, headers, body: JSON.stringify(resolved) };
};
