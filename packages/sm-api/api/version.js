const current = "0.0.15-alpha.4";
const deprecatedUnder = "0.0.14";
const cors = require("../common/cors");

module.exports = cors((req, res) => {
  res.send({ current, deprecatedUnder });
});
