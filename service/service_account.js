const tool = require('../modules/tool');
const db = require('../modules/mysql');

module.exports = {
    getAccountList: async (req, res) => {
        let sql;
        let output;

        sql = ' SELECT token, name, type, account, bind FROM `account` WHERE `account` != "administrator" ';

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

    bindChannel: async (req, res) => {
        let params = req.body;
        let sql;
        let check;

        let rule = {
            token: 'required|string',
            bind: 'required|string'
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

        sql = ' SELECT account FROM `account` WHERE token = ? ';
        sql = tool.format(sql, [params.token]);

        try {
            check = await db.asyncActionDB(sql);
            if (!check.length) {  //檢查token是否存在
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

        sql = ' UPDATE `account` SET bind = ? WHERE token = ? ';
        sql = tool.format(sql, [params.bind, params.token]);

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
};