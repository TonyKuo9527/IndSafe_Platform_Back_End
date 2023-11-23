const db = require('../modules/mysql');
const tool = require('../modules/tool');

const { v1: uuidv1, v4: uuidv4 } = require('uuid');

module.exports = {
    getChannel: async (req, res) => {
        let sql;
        let output;

        sql = ' SELECT * FROM `channel` ';

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

    createChannel: async (req, res) => {
        let params = req.body;
        let sql;
        let check;
        let uuid = uuidv1() + '-' + uuidv4();

        let rule = {
            channelName: 'required|string',
            description: 'string'
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

        sql = ' SELECT * FROM `channel` WHERE channelName = ? ';
        sql = tool.format(sql, [params.channelName]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length) {  //確認是否有重複的channelName
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

        sql = ' INSERT INTO `channel` (id, channelName, description) VALUE (?,?,?) ';
        sql = tool.format(sql, [uuid,
            params.channelName,
            params.description]);

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

    updateChannel: async (req, res) => {
        let params = req.body;
        let sql;
        let check;

        let rule = {
            id: 'required|string',
            channelName: 'required|string',
            description: 'string'
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

        sql = ' SELECT * FROM `channel` WHERE id = ? ';
        sql = tool.format(sql, [params.id]);

        try {
            check = await db.asyncActionDB(sql);
            if (!check.length) {  //確認ID是否存在
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

        sql = ' SELECT * FROM `channel` WHERE id != ? AND channelName = ? ';
        sql = tool.format(sql, [params.id, params.channelName]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length) {  //確認是否有重複的name
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

        sql = ' UPDATE `channel` SET channelName = ?, description = ? WHERE id = ? ';
        sql = tool.format(sql, [params.channelName,
        params.description,
        params.id]);

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

    removeChannel: async (req, res) => {
        let params = req.body;
        let sql;
        let check;

        let rule = {
            id: 'required|string'
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

        sql = ' SELECT * FROM `channel` WHERE id = ? ';
        sql = tool.format(sql, [params.id]);

        try {
            check = await db.asyncActionDB(sql);
            if (!check.length) {  //id不存在則返回102
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

        sql = ' SELECT * FROM `camera` WHERE channelID = ? ';
        sql = tool.format(sql, [params.id]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length) {  //channel使用中不允許刪除
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

        sql = ' SELECT * FROM `notify` WHERE channelID = ? ';
        sql = tool.format(sql, [params.id]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length) {  //channel使用中不允許刪除
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

        sql = ' DELETE FROM `channel` WHERE id = ? ';
        sql = tool.format(sql, [params.id]);

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