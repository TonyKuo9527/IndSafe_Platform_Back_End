require('dotenv').config();

const tool = require('../modules/tool');
const db = require('../modules/mysql');
const JWT = require('../modules/jwt');
const redis = require('../modules/redis');

const md5 = require('crypto-js/md5');

const { v1: uuidv1, v4: uuidv4 } = require('uuid');

module.exports = {
    login: async (req, res) => {
        let params = req.body;
        let sql;
        let check;
        let output;
        let ip;

        params.password = md5(params.password).toString();

        if (req.ip.match(/\d+\.\d+\.\d+\.\d+/)) {
            ip = req.ip.match(/\d+\.\d+\.\d+\.\d+/)[0];
        } else {
            ip = req.ip;
        };

        let uuid = uuidv1() + '-' + uuidv4();
        let timestamp = tool.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')

        try {
            check = await redis.actionDB(['GET', ip]);
            if (parseInt(check) === 3) {
                res.json({
                    "status": 104
                })
                return
            }
        } catch {
            res.json({
                "status": 0
            })
            return
        };

        try {
            check = await redis.actionDB(['GET', params.account]);
            if (parseInt(check) === 3) {
                res.json({
                    "status": 105
                })
                return
            }
        } catch {
            res.json({
                "status": 0
            })
            return
        };

        let rule = {
            account: 'required|string',
            password: 'required|string'
        };

        check = await tool.checkType(params, rule);

        if (check.status === 101) {  //確認格式檢查結果
            res.json(check);
            return
        };

        check = false;
        check = await tool.checkString(params);

        if (!check) {  //檢查字串是否有特殊符號
            res.json({
                "status": 110
            });
            return
        };

        sql = ' SELECT * FROM `account` WHERE account = ? ';
        sql = tool.format(sql, [params.account]);

        try {
            check = await db.asyncActionDB(sql);
            if (!check.length) {  //檢查帳號是否存在

                check = await redis.actionDB(['INCR', ip]);
                if (parseInt(check) === 3) await redis.actionDB(['EXPIRE', ip, process.env.REQ_LIMIT]);

                sql = ' INSERT INTO `system_log` (id, account, ip, behavior, timestamp) VALUES (?, ?, ?, ?, ?) ';
                sql = tool.format(sql, [uuid, params.account, ip, '帳號不存在', timestamp]);
                await db.asyncActionDB(sql);

                res.json({
                    "status": 102
                });
                return
            };
        } catch {
            res.json({
                "status": 0
            });
            return
        };

        sql = ' SELECT account, type, token, resetPasswordTimestamp FROM `account` WHERE account = ? AND password = ?';
        sql = tool.format(sql, [params.account, params.password]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length) {

                if (tool.formatDate(check[0].resetPasswordTimestamp, 'yyyy-MM-dd hh:mm:ss') > tool.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss') ||
                    check[0].type === 'admin') { //檢查密碼是否過期
                    await redis.actionDB(['DEL', ip]);
                    await redis.actionDB(['DEL', params.account]);

                    sql = ' INSERT INTO `system_log` (id, account, ip, behavior, timestamp) VALUES (?, ?, ?, ?, ?) ';
                    sql = tool.format(sql, [uuid, params.account, ip, '成功登入', timestamp]);
                    await db.asyncActionDB(sql);

                    output = {
                        account: check[0].account,
                        type: check[0].type,
                        token: check[0].token
                    };
                } else {
                    res.json({
                        "status": 106
                    });
                    return
                };
            } else {

                check = await redis.actionDB(['INCR', ip]);
                if (parseInt(check) === 3) await redis.actionDB(['EXPIRE', ip, process.env.REQ_LIMIT]);

                check = await redis.actionDB(['INCR', params.account]);
                if (parseInt(check) === 3) await redis.actionDB(['EXPIRE', params.account, process.env.REQ_LIMIT]);

                sql = ' INSERT INTO `system_log` (id, account, ip, behavior, timestamp) VALUES (?, ?, ?, ?, ?) ';
                sql = tool.format(sql, [uuid, params.account, ip, '密碼錯誤', timestamp]);
                await db.asyncActionDB(sql);

                res.json({
                    "status": 103
                });
                return
            };
        } catch {
            res.json({
                "status": 0
            });
            return
        };

        try {
            output.jwt = await JWT.production_token(output.token, output.account);
            res.json({
                "status": 1,
                "data": output
            });
            return
        } catch {
            res.json({
                "status": 0
            });
            return
        };

    },

    checkJWT: async (req, res) => {
        const result = await JWT.verify_token(req.headers.authorization);
        if (result) {
            res.json({
                "status": 1
            });
        } else {
            res.json({
                "status": 0,
            });
        };
    },
};