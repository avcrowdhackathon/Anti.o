const router = require('express').Router();

router.use('/', require('./news/index'));

module.exports = router;
