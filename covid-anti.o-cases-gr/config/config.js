/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const _ = require('lodash');

const config = {
  dev: 'development',
  prod: 'production',
  port: process.env.PORT || 3001,
};

config.env = process.env.NODE_ENV || config.dev;

// after requiring the above file
// with a try catch
let envConfig;

try {
  envConfig = require(`./${config.env}`);
  envConfig = envConfig || {};
} catch (e) {
  envConfig = {};
  console.log(e);
}

// adding that variables to the config
// that the file which has been required has
module.exports = _.merge(config, envConfig);
