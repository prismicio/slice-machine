const fs = require('fs');
const request = require("request");
const tmp = require('tmp');
const cors = require("../common/cors");

const fetchLibrary = require('./library').fetchLibrary

module.exports = async (req, res) => {
  const {
    query: { lib, library, framework = 'nuxt' }
  } = req;
  const defaultLibrary = require(`../bootstrap/${framework}`).defaultLibrary;
  const packageName = lib || library || defaultLibrary.packageName;

  if (!packageName) {
    return res
      .status(400)
      .send(
        'Endpoint expects query parameter "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
      );
  }

  const sm = await fetchLibrary(packageName);

  res.json(sm.slices);
};

