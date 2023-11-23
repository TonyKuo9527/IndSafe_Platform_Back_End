const path = require('path');
const tool = require('../modules/tool');
const db = require('../modules/mysql');
const lineNotify = require('../modules/notify');
const md5 = require('crypto-js/md5');

module.exports = {
    subscription: async (req, res) => {
        const code = req.query.code;
        const channelID = req.query.channelID;
        const userId = req.query.userId;

        let token;
        let sql;
        let result;

        sql = ' SELECT * FROM account WHERE `token` = ? ';
        sql = tool.format(sql, [userId]);

        try {
            result = await db.asyncActionDB(sql);
            if (result.length === 0) {
                res.send('尚未註冊，請註冊後再訂閱!');
                return
            }
        } catch {
            res.json({
                "status": 0
            })
            return
        }

        try {
            token = await lineNotify.getToken(code, channelID, userId);
        } catch (err) {
            res.send('token取得錯誤!');
            return
        }

        result = await lineNotify.getStatus(token);

        if (result.status !== 200) {
            res.send('token狀態異常!');
            return
        }

        sql = ' INSERT INTO `notify` (token, channelID, userToken, type, target) VALUE (?,?,?,?,?) ';
        sql = tool.format(sql, [token,
            channelID,
            userId,
            result.targetType,
            result.target]);

        try {
            await db.asyncActionDB(sql);
        } catch (err) {
            await lineNotify.revokeToken(token);
            res.send('error, 訂閱失敗!');
            return
        };

        res.sendFile('callback.html', { root: path.join(__dirname, '../web') });
    },

    getAlertInfo: async (req, res) => {
        let params = req.body;
        let sql;
        let output;
        let check;
        let bind;

        sql = ' SELECT * FROM account WHERE `token` = ? ';
        sql = tool.format(sql, [params.token]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length === 0) {
                res.json({  // 未註冊
                    "status": 102
                })
                return
            }
        } catch {
            res.json({
                "status": 0
            })
            return
        }

        bind = check[0].bind.split(';');

        sql = ' SELECT alert.image, alert.type, alert.cameraID, DATE_FORMAT(alert.timestamp, "%Y-%m-%d %H:%i:%s") as timestamp, alert.description, camera.rtsp, ' +
            ' channel.channelName, channel.id FROM ((`alert` JOIN `camera` ON `alert`.cameraID = `camera`.cameraID) JOIN `channel` ON `camera`.channelID = `channel`.id) ' +
            ' WHERE alert.image = ? ';
        sql = tool.format(sql, [params.image]);

        try {
            output = await db.asyncActionDB(sql);

            if (output.length === 0) {
                res.json({  // 查無資料
                    "status": 103
                })
            } else if (bind.indexOf(output[0].id) === -1) {
                res.json({  // 未綁定該頻道
                    "status": 104
                })
            } else {
                res.json({
                    "status": 1,
                    "data": output
                })
            }
            return
        } catch {
            res.json({
                "status": 0
            })
        }
    },

    checkToken: async (req, res) => {
        let params = req.body;
        let sql;
        let output;

        let rule = {
            token: 'required|string',
        };

        let check = await tool.checkType(params, rule);

        if (check.status === 101) {
            res.json(check);
            return
        };

        check = false;
        check = await tool.checkString(params);

        if (!check) {  //檢查字串是否有特殊符號
            res.json({
                "status": 110
            })
            return
        };

        sql = ' SELECT token, name, account FROM account WHERE token = ? ';
        sql = tool.format(sql, [params.token]);

        try {
            output = await db.asyncActionDB(sql);
            if (output.length) {
                res.json({
                    "status": 1,
                    "data": output
                });
            } else {
                res.json({
                    "status": 102
                });
            };
        } catch {
            res.json({
                "status": 0
            });
        };
    },

    createAccount: async (req, res) => {
        let params = req.body;
        let sql;
        let check;

        const regex = new RegExp("^((?=.{8,12}$)(?=.*[a-z])(?=.*[A-Z]))");

        let rule = {
            token: 'required|string',
            name: 'required|string',
            account: 'required|string',
            password: 'required|string',
            channelName: 'required|string',
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

        if (!regex.test(params.password)) {  //確認密碼格式
            res.json({
                "status": 104
            });
            return
        };

        params.password = md5(params.password).toString();

        sql = ' SELECT account FROM `account` WHERE account = ? ';
        sql = tool.format(sql, [params.account]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length) {  //檢查帳號是否存在
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

        sql = ' SELECT id FROM `channel` WHERE channelName = ? ';
        sql = tool.format(sql, [params.channelName]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length === 0) { //檢查頻道是否存在
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

        sql = ' INSERT INTO `account` (token, name, type, account, password, bind, historyPasswordList, resetPasswordTimestamp) VALUE (?, ?, ?, ?, ?, ?, ?, ?) ';
        sql = tool.format(sql, [params.token,
        params.name,
            'user',
        params.account,
        params.password,
        check[0].id,
        params.password,
        tool.formatDate(tool.getToDay(90), 'yyyy-MM-dd hh:mm:ss')]);

        try {
            output = await db.asyncActionDB(sql);
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

    resetPassword: async (req, res) => {
        let params = req.body;
        let sql;
        let check;
        let historyPasswordList;
        let token;

        const regex = new RegExp("^((?=.{8,12}$)(?=.*[a-z])(?=.*[A-Z]))");

        let rule = {
            account: 'required|string',
            password: 'required|string'
        };

        check = await tool.checkType(params, rule);

        if (check.status === 101) {  //確認格式檢查結果
            res.json(check);
            return
        };

        check = await tool.checkString(params);

        if (!check) {  //檢查字串是否有特殊符號
            res.json({
                "status": 110
            });
            return
        };

        if (!regex.test(params.password)) {  //確認密碼格式
            res.json({
                "status": 104
            });
            return
        };

        params.password = md5(params.password).toString();

        sql = ' SELECT token, historyPasswordList FROM `account` WHERE account = ? ';
        sql = tool.format(sql, [params.account]);

        try {
            check = await db.asyncActionDB(sql);
            token = check[0].token;
            if (!check.length) {  //檢查account是否存在
                res.json({
                    "status": 102
                });
                return
            } else {
                historyPasswordList = check[0].historyPasswordList.split(';');
                if (historyPasswordList.includes(params.password)) {  //檢查是否為歷史密碼
                    res.json({
                        "status": 103
                    });
                    return
                };
            };
        } catch {
            res.json({
                "status": 0
            });
            return
        };

        if (historyPasswordList.length >= 3) historyPasswordList.shift(); //檢查歷史密碼是否超過3筆

        historyPasswordList.push(params.password);
        historyPasswordList = historyPasswordList.join(';');

        sql = ' UPDATE `account` SET password = ?, historyPasswordList = ?, resetPasswordTimestamp = ? WHERE token = ? ';
        sql = tool.format(sql, [params.password, historyPasswordList, tool.formatDate(tool.getToDay(90), 'yyyy-MM-dd hh:mm:ss'), token]);

        try {
            await db.asyncActionDB(sql);
            res.json({
                "status": 1
            });
            return
        } catch {
            res.json({
                "status": 0
            });
            return
        };
    },
}