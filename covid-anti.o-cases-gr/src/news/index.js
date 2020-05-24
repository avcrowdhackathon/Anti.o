const router = require('express').Router();
const controller = require('./indexController');

router.route('/')
  .get(controller.get);

module.exports = router;
