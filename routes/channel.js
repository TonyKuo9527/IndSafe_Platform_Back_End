const express = require('express');
const router = express.Router();

const service = require('../service/service_channel');

router.get('/', (req, res) => service.getChannel(req, res));

router.post('/', (req, res) => service.createChannel(req, res));

router.put('/', (req, res) => service.updateChannel(req, res));

router.delete('/', (req, res) => service.removeChannel(req, res));

module.exports = router;