const express = require('express');
const router = express.Router();

const service = require('../service/service_camera');

router.get('/', (req, res) => service.getCamera(req, res));

router.get('/:token', (req, res) => service.getCameraForLive(req, res));

router.post('/', (req, res) => service.createCamera(req, res));

router.put('/', (req, res) => service.updateCamera(req, res));

router.delete('/', (req, res) => service.removeCamera(req, res));

module.exports = router;