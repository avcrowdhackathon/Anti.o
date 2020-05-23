var router = require('express').Router();
var controller = require('./indexController');

router.route('/')
  .get(controller.get)

module.exports = router;