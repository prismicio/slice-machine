'use strict';
const api = require('./api');

// maybe inject mongo here?

// https://www.npmjs.com/package/serverless-req-res
module.exports.bootstrap = api.bootstrap
module.exports.frameworks = api.frameworks
module.exports.libraries = api.libraries
module.exports.library = api.library
module.exports.publish = api.publish
module.exports.slices = api.slices
module.exports.version = api.version
