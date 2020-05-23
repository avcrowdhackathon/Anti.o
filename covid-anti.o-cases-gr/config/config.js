var _ = require('lodash');

var config = {
  dev:'development',
  prod:'production',
  port: process.env.PORT || 3001,
  seed: true
};

//checking to see if the node enviroment is set
//if not then set it to development mode
//on heroku the default is NODE_ENV=production
process.env.NODE_ENV = process.env.NODE_ENV || config.dev
//stores to the config object the property env
//with a value for later use
config.env = process.env.NODE_ENV;

//after requiring the above file
//with a try catch
var envConfig;

try{
  envConfig = require('./' + config.env);
  envConfig = envConfig || {};
}
catch(e){
  envConfig = {};
  console.log(e);
}

//adding that variables to the config
//that the file which has been required has
module.exports = _.merge(config, envConfig);
