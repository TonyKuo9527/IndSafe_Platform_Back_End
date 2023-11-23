const express = require('express');
const router = express.Router();

const service = require('../service/service_notify');

router.get('/', (req, res) => service.getNotifyList(req, res));

router.delete('/', (req, res) => service.cancelNotify(req, res));
  
module.exports = router;