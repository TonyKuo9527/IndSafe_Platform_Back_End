const express = require('express');
const router = express.Router();

const service = require('../service/service_account');

router.get('/', (req, res) => service.getAccountList(req, res));

router.put('/bind', (req, res) => service.bindChannel(req, res));

module.exports = router;