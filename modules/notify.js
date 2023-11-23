require('dotenv').config();

const queryString   = require('query-string');
const axios         = require('axios');

module.exports = {
    getAuthLink: function(channelID, userId) {
        const data = {
            response_type: 'code',
            client_id: process.env.Client_ID,
            redirect_uri: process.env.HTTPS_URL + '/line_service/callback' + '?channelID=' + channelID + '&userId=' + userId,
            scope: 'notify',
            state: process.env.STATE,
        };

        return `https://notify-bot.line.me/oauth/authorize?${queryString.stringify(data)}`;
    },

    getToken: function(code, channelID, userId) {
        return new Promise((resolve, reject) => {
            const url = 'https://notify-bot.line.me/oauth/token';

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            axios({
                method: 'post',
                url: url,
                headers:headers,
                params:{
                    'grant_type':'authorization_code',
                    'code':code,
                    'redirect_uri': process.env.HTTPS_URL + '/line_service/callback' + '?channelID=' + channelID + '&userId=' + userId,
                    'client_id':    process.env.Client_ID,
                    'client_secret':process.env.Client_Secret
                }
            })
            .then(res => {
                resolve(res.data.access_token);
            })
            .catch(err => {
                reject();
            })
        })
    },

    getStatus: function(token) {
        return new Promise((resolve, reject) => {
            const url = 'https://notify-api.line.me/api/status';

            const headers = {
                Authorization: `Bearer ${token}`
            };

            axios({
                method: 'get',
                url: url,
                headers:headers,
            })
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject();
            })
        })
    },

    sendNotify: function(token, message) {
        return new Promise((resolve, reject) => {
            const url = 'https://notify-api.line.me/api/notify';

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token}`
            };

            axios({
                method: 'post',
                url: url,
                headers:headers,
                params:{
                    'message':message
                }
            })
            .then(res => {
                resolve();
            })
            .catch(err => {
                reject();
            })
        })
    },

    revokeToken: function(token) {
        return new Promise((resolve, reject) => {
            const url = 'https://notify-api.line.me/api/revoke';

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token}`
            };

            axios({
                method: 'post',
                url: url,
                headers:headers,
            })
            .then(res => {
                resolve();
            })
            .catch(err => {
                reject();
            })

        })
    }
};