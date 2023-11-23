const express = require('express');
const router = express.Router();

const service = require('../service/service_bot');

router.post('/', (req, res) => service.autoReply(req, res));
  
module.exports = router;