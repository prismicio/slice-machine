const fs = require('fs');
const request = require("request");
const tmp = require('tmp');

const fetchLibrary = require('./library').fetchLibrary

module.exports = async (req, res) => {
  const {
    query: { lib, library, framework = 'nuxt' }
  } = req;
  const defaultLibrary = require(`../bootstrap/${framework}`).defaultLibrary;
  const packageName = lib || library || defaultLibrary.packageName;

  if (!packageName) {
    // res.error ?
    return res
      .send(400,
        'Endpoint expects query parameter "lib" to be defined.\nExample request: `/api/library?lib=my-lib`'
      );
  }

  const sm = await fetchLibrary(packageName);

  res.json(sm.slices);
};

