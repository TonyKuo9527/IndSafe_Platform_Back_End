const express = require('express');
const router = express.Router();

const service = require('../service/service_alert');

router.get('/:token', (req, res) => service.getAlert(req, res));

router.get('/:image', (req, res) => service.getAlertInfo(req, res));

router.post('/', (req, res) => service.createAlert(req, res));

router.delete('/', (req, res) => service.deleteAlert(req, res));
  
module.exports = router;