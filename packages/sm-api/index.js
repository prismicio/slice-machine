const cors = require("../common/cors");

module.exports = cors((req, res) => {
  res.redirect('/api');
});
