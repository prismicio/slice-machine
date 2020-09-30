'use strict';
var reqRes = require('serverless-req-res');
const api = require('./api');

// https://www.npmjs.com/package/serverless-req-res
module.exports.bootstrap = reqRes(api.bootstrap).run;
module.exports.frameworks = reqRes(api.frameworks).cors(true).run;
module.exports.job = reqRes(api.job).run;
module.exports.libraries = reqRes(api.libraries).cors(true).run;
module.exports.library = reqRes(api.library).cors(true).run;
module.exports.publish = reqRes(api.publish).cors(true).run;
module.exports.slices = reqRes(api.slices).cors(true).run;
module.exports.version = reqRes(api.version).cors(true).run;