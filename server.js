require('dotenv').config();

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const line = require('@line/bot-sdk');

const JWT = require('./modules/jwt');

const config = {
    channelAccessToken: process.env.channel_AccessToken,
    channelSecret: process.env.channel_Secret
};

const corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
};

const app = express();

app.set('trust proxy', true);

const bot = require('./routes/bot');
const lineService = require('./routes/lineService');
const auth = require('./routes/auth');
const account = require('./routes/account')
const channel = require('./routes/channel');
const notify = require('./routes/notify');
const camera = require('./routes/camera');
const alert = require('./routes/alert');

app.use('/webhook', line.middleware(config), bot);

app.use(bodyParser.json({
    limit: '10mb'
}));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(cors(corsOptions));

app.use(express.static('web'));

app.use('/line_service', lineService);

app.use('/auth', auth);

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/web/register.html');
});

app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/web/view.html');
});

app.get('/image/:image', (req, res) => {
    res.sendFile(__dirname + '/web/uploads/' + req.params.image);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/web/index.html');
});

app.use(async (req, res, next) => {
    if (req.method === 'GET') return next()

    const result = await JWT.verify_token(req.headers.authorization);

    if (!result) {
        res.json({
            "status": 121,
            "data": {}
        })
        return
    };

    return next();
});

app.use('/account', account);

app.use('/channel', channel);

app.use('/notify', notify);

app.use('/camera', camera);

app.use('/alert', alert);

var httpServer = http.createServer(app);

httpServer.listen(process.env.PORT, () => {
    console.log('啟動成功 Port: ' + process.env.PORT);
});