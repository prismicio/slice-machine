const { version } = require('../package.json');
const deprecatedUnder = "0.0.14";

module.exports = (req, res) => res.json({ current: version, deprecatedUnder });
