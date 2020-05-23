var router = require('express').Router();

router.use('/covid19', require('./api/covid19/covid19Routes'));
  
module.exports = router;
