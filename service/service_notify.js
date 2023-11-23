const lineNotify = require('../modules/notify');
const db = require('../modules/mysql');
const tool = require('../modules/tool');

module.exports = {
    getNotifyList: async (req, res) => {
        let sql;
        let output;

        sql = ' SELECT `notify`.token, `notify`.type, `notify`.target, `channel`.channelName, `account`.name FROM ((`notify` JOIN `channel` ON `notify`.channelID = `channel`.id) JOIN `account` ON `notify`.userToken = `account`.token) ';

        try {
            output = await db.asyncActionDB(sql);
            res.json({
                "status": 1,
                "data": output
            });
            return
        } catch {
            res.json({
                "status": 0,
                "data": []
            });
            return
        };
    },

    cancelNotify: async (req, res) => {
        let sql;
        let check;
        let params = req.body;

        let rule = {
            token: 'required|string'
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
            })
            return
        };

        sql = ' SELECT * FROM `notify` WHERE token = ? ';
        sql = tool.format(sql, [params.token]);

        try {
            check = await db.asyncActionDB(sql);
            if (!check.length) {  //檢查token是否存在
                res.json({
                    "status": 102
                });
                return
            };
        } catch (err) {
            res.json({
                "status": 0
            });
            return
        };

        await lineNotify.revokeToken(params.token);

        sql = ' DELETE FROM `notify` WHERE token= ? ';
        sql = tool.format(sql, [params.token]);

        try {
            await db.asyncActionDB(sql);
            res.json({
                "status": 1
            });
            return
        } catch (err) {
            res.json({
                "status": 0
            });
            return
        };
    },
};