var router = require('express').Router();
var controller = require('./covid19Controller');

router.route('/all')
  .get(controller.get)

router.route('/all/:fileformat')
  .get(controller.get)

module.exports = router;
