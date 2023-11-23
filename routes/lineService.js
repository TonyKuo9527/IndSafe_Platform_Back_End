const express = require('express');
const router = express.Router();

const service = require('../service/service_line');

router.get('/callback', (req, res) => service.subscription(req, res));

router.post('/getAlertInfo', (req, res) => service.getAlertInfo(req, res));

router.post('/checkToken', (req, res) => service.checkToken(req, res));

router.post('/register', (req, res) => service.createAccount(req, res));

router.put('/', (req, res) => service.resetPassword(req, res));

module.exports = router;