const express = require('express');
const router = express.Router();
const service = require('../service/service_auth');

router.post('/login', (req, res) => service.login(req, res));

router.post('/checkJWT', (req, res) => service.checkJWT(req, res));

module.exports = router;