require('dotenv').config();

const mysql = require('mysql');
const tool = require('./tool');
const jwt = require('jsonwebtoken');

const pool = mysql.createPool({
    host: process.env.DB_SERVER_HOST,
    user: process.env.DB_SERVER_USER,
    password: process.env.DB_SERVER_PASSWORD,
    database: process.env.DB_SERVER_DATABASE,
    waitForConnections: true,
    // 連線池可建立的總連線數上限(預設上限10個連線數)
    connectionLimit: 5
});

module.exports = {
    production_token: (token, account) => {
        return new Promise((resolve, reject) => {
            const payload = {
                token: token,
                account: account
            };
            const expiry = Math.floor(Date.now() / 1000) + (60 * process.env.TOKEN_EFFECTIVE_TIME);

            resolve(jwt.sign({ payload, exp: expiry }, process.env.JWT_KEY))
        });
    },

    production_token_by_admin: (token, account) => {
        return new Promise((resolve, reject) => {
            const payload = {
                token: token,
                account: account
            };

            resolve(jwt.sign({ payload }, process.env.JWT_KEY))
        });
    },

    verify_token: (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
                if (err) {
                    resolve(false);
                } else {
                    const data = payload.payload;

                    if (!payload) resolve(false); //無效Token

                    let sql;

                    sql = ' SELECT * FROM `account` WHERE `account` = ? AND `token` = ? ';
                    sql = tool.format(sql, [data.account, data.token]);


                    pool.getConnection(function (err, connection) {

                        if (err) reject(err)

                        connection.query(sql, function (err, result) {
                            if (err) reject(err)

                            connection.release();

                            if (!result.length) resolve(false);

                            resolve(true);
                        })
                    })
                }
            })
        })
    },
};