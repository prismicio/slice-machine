const bootstrap = require('./bootstrap');
const frameworks = require('./frameworks');
const libraries = require('./libraries');
const library = require('./library');
const publish = require('./publish');
const slices = require('./slices');
const version = require('./version');
const job = require('./job')

module.exports = {
  bootstrap,
  frameworks,
  job,
  libraries,
  library,
  publish,
  slices,
  version,
};
