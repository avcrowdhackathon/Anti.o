var router = require('express').Router();
var request = require('request-promise');
const querystring = require('querystring');

exports.get = async function(req,res,next){
  
  var newUrl = 'https://newsapi.org/v2/everything?' +querystring.stringify(req.query);
  console.log('Making request on '+newUrl);

  request(newUrl)
  .pipe(res)

};
