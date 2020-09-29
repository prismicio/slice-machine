'use strict';
var reqRes = require('serverless-req-res');
const api = require('./api');

// https://www.npmjs.com/package/serverless-req-res
module.exports.bootstrap = reqRes(api.bootstrap).run;
module.exports.frameworks = reqRes(api.frameworks).run;
module.exports.job = reqRes(api.job).run;
module.exports.libraries = reqRes(api.libraries).run;
module.exports.library = reqRes(api.library).run;
module.exports.publish = reqRes(api.publish).run;
module.exports.slices = reqRes(api.slices).run;
module.exports.version = reqRes(api.version).run;