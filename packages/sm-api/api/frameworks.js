const handleStripKeys = require("../common").handleStripKeys;
const {
  defaultStripKeys,
  SUPPORTED_FRAMEWORKS
} = require("../common/consts");
const cors = require("../common/cors");

module.exports = cors(async (req, res) => {
  const {
    query: {
      strip,
      preserveDefaults
    }
  } = req;

  const keysToStrip = handleStripKeys(strip, defaultStripKeys.framework, preserveDefaults);

  const frameworks = SUPPORTED_FRAMEWORKS.map(async (framework) => ({
    f: require(`../bootstrap/${framework}`),
    framework
  }))

  const resolved = (await Promise.all(frameworks))
    .map(({ f, framework }) => ({ manifest: f, framework }))
  resolved.forEach((framework) => {
    keysToStrip.forEach((key) => {
      delete framework[key]
    })
  })
  res.send(resolved)
});
