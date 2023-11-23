const db = require('../modules/mysql');
const tool = require('../modules/tool');

const { v1: uuidv1, v4: uuidv4 } = require('uuid');

module.exports = {
    getCamera: async (req, res) => {
        let sql;
        let output;

        sql = ' SELECT `camera`.id, `camera`.cameraID, `camera`.channelID, `camera`.rtsp, `camera`.description, `channel`.channelName ' +
            ' FROM (`camera` JOIN `channel` ON `camera`.channelID = `channel`.id) ORDER BY `camera`.channelID, `camera`.cameraID ASC ';

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

    getCameraForLive: async (req, res) => {
        let sql;
        let output;
        let bind;

        sql = ' SELECT * FROM `account` WHERE token = ? ';
        sql = tool.format(sql, [req.params.token]);

        try {
            check = await db.asyncActionDB(sql);
            if (!check.length) {  //檢查token是否存在
                res.json({
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

        if (check[0].bind === 'ALL') {  //檢查權限
            sql = ' SELECT `camera`.id, `camera`.cameraID, `camera`.channelID, `camera`.rtsp, `camera`.description, `channel`.channelName ' +
                ' FROM (`camera` JOIN `channel` ON `camera`.channelID = `channel`.id) ORDER BY `camera`.channelID, `camera`.cameraID ASC ';
        } else {
            bind = check[0].bind.split(';');
            sql = ' SELECT `camera`.id, `camera`.cameraID, `camera`.channelID, `camera`.rtsp, `camera`.description, `channel`.channelName ' +
                ' FROM (`camera` JOIN `channel` ON `camera`.channelID = `channel`.id) ';

            for (let i = 0; i < bind.length; i++) {
                if (i === 0) {
                    sql += ' WHERE `channel`.id = ? ';
                } else {
                    sql += ' OR `channel`.id = ? ';
                }
            }

            sql = tool.format(sql, bind);

            sql += ' ORDER BY `camera`.channelID, `camera`.cameraID ASC ';
        }

        try {
            output = await db.asyncActionDB(sql);
            res.json({
                "status": 1,
                "data": output
            })
        } catch {
            res.json({
                "status": 0
            })
        }
    },

    createCamera: async (req, res) => {
        let params = req.body;
        let sql;
        let check;
        let uuid = uuidv1() + '-' + uuidv4();

        let rule = {
            cameraID: 'required|string',
            channelID: 'required|string',
            rtsp: 'required|string',
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

        sql = ' SELECT * FROM `camera` WHERE `cameraID` = ? ';
        sql = tool.format(sql, [params.cameraID]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length) { //確認是否有重複
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

        sql = ' INSERT INTO `camera` (id, cameraID, channelID, rtsp, description) VALUE (?,?,?,?,?) ';
        sql = tool.format(sql, [uuid,
            params.cameraID,
            params.channelID,
            params.rtsp,
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

    updateCamera: async (req, res) => {
        let params = req.body;
        let sql;
        let check;

        let rule = {
            id: 'required|string',
            cameraID: 'required|string',
            channelID: 'required|string',
            rtsp: 'required|string',
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

        sql = ' SELECT * FROM `camera` WHERE id = ? ';
        sql = tool.format(sql, [params.id]);

        try {
            check = await db.asyncActionDB(sql);
            if (!check.length) {  //確認是否有此筆資料
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

        sql = ' SELECT * FROM `camera` WHERE id != ? and cameraID = ? and channelID = ? ';
        sql = tool.format(sql, [params.id, params.cameraID, params.channelID]);

        try {
            check = await db.asyncActionDB(sql);
            if (check.length) {  //確認資料是否有重複
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

        sql = ' UPDATE `camera` SET cameraID = ?, channelID = ?, rtsp = ?, description = ? WHERE id = ? ';
        sql = tool.format(sql, [params.cameraID,
        params.channelID,
        params.rtsp,
        params.description,
        params.id]);

        try {
            await db.asyncActionDB(sql);
            res.json({
                "status": 1
            });
        } catch {
            res.json({
                "status": 0
            });
        };
    },

    removeCamera: async (req, res) => {
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

        sql = ' SELECT * FROM `camera` WHERE id = ? ';
        sql = tool.format(sql, [params.id]);

        try {
            check = await db.asyncActionDB(sql);
            if (!check.length) {  //確認是否有此筆資料
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

        sql = ' DELETE FROM `camera` WHERE id = ? ';
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