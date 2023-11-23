require('dotenv').config();

const db = require('../modules/mysql');
const tool = require('../modules/tool');
const lineNotify = require('../modules/notify');
const { v1: uuidv1, v4: uuidv4 } = require('uuid');

module.exports = {
    getAlert: async (req, res) => {
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
            sql = ' SELECT alert.image, alert.type, alert.cameraID, DATE_FORMAT(alert.timestamp, "%Y-%m-%d %H:%i:%s") as timestamp, alert.description, ' +
                ' camera.rtsp, channel.channelName FROM ((`alert` JOIN `camera` ON `alert`.cameraID = `camera`.cameraID) JOIN `channel` ON `camera`.channelID = `channel`.id) ' +
                ' ORDER BY timestamp ASC ';
        } else {
            bind = check[0].bind.split(';');
            sql = ' SELECT alert.image, alert.type, alert.cameraID, DATE_FORMAT(alert.timestamp, "%Y-%m-%d %H:%i:%s") as timestamp, alert.description, ' +
                ' camera.rtsp, channel.channelName FROM ((`alert` JOIN `camera` ON `alert`.cameraID = `camera`.cameraID) JOIN `channel` ON `camera`.channelID = `channel`.id) '

            for (let i = 0; i < bind.length; i++) {
                if (i === 0) {
                    sql += ' WHERE `channel`.id = ? ';
                } else {
                    sql += ' OR `channel`.id = ? ';
                }
            }

            sql = tool.format(sql, bind);

            sql += ' ORDER BY timestamp ASC ';
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

    getAlertInfo: async (req, res) => {
        let sql;
        let output;

        sql = ' SELECT image, type, cameraID, DATE_FORMAT(timestamp, "%Y-%m-%d %H:%i:%s") as timestamp, description FROM `alert` WHERE image = ? ORDER BY timestamp ASC';
        sql = tool.format(sql, [req.params.image]);

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

    createAlert: async (req, res) => {
        let sql;
        let check;
        let list;
        let url;
        let timestamp = tool.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss');
        let uuid = uuidv1() + '-' + uuidv4() + '.jpg';

        let params = req.body;

        let rule = {
            image: 'required|string',
            type: 'required|integer',
            cameraID: 'required|string'
        }

        check = await tool.checkType(params, rule);

        if (check.status === 101) {  //確認格式檢查結果
            res.json(check);
            return
        }

        try {
            await tool.save_image(params.image, uuid);
        } catch {
            res.json({
                "status": 111,
            })
            return
        };

        sql = ' SELECT * FROM `camera` WHERE cameraID = ? ';
        sql = tool.format(sql, [params.cameraID]);

        try {
            list = await db.asyncActionDB(sql);
            if (list.length === 0) {
                res.json({
                    "status": 102,
                })
                tool.deleteImage(uuid);
                return
            }
        } catch {
            res.json({
                "status": 0
            })
            tool.deleteImage(uuid);
            return
        }

        if (!params.description) params.description = '';

        sql = ' INSERT INTO `alert`(image, type, cameraID, timestamp, description) VALUES(?,?,?,?,?) ';
        sql = tool.format(sql, [uuid,
            params.type,
            params.cameraID,
            timestamp,
            params.description]);

        try {
            await db.asyncActionDB(sql);
        } catch {
            res.json({
                "status": 0
            })
            tool.deleteImage(uuid);
            return
        }

        url = process.env.VIEW_URL + '#' + uuid;

        sql = ' SELECT `notify`.token FROM (`notify` INNER JOIN `camera` ON `notify`.channelID = `camera`.channelID ) WHERE `camera`.cameraID = ?';
        sql = tool.format(sql, [params.cameraID]);

        try {
            list = await db.asyncActionDB(sql);
        } catch {
            res.json({
                "status": 0,
            })
            return
        }

        for (let i = 0; i < list.length; i++) {
            try {
                await lineNotify.sendNotify(list[i].token, '警報資訊 : ' + url);
            } catch {
                // 傳送失敗
            }
        }

        res.json({
            "status": 1
        })
        return
    },

    deleteAlert: async (req, res) => {
        let sql;
        let check;
        let params = req.body;

        let rule = {
            image: 'required|string',
        }

        check = await tool.checkType(params, rule);

        if (check.status === 101) {  //確認格式檢查結果
            res.json(check);
            return
        }

        sql = ' SELECT * FROM `alert` WHERE image = ? ';
        sql = tool.format(sql, [params.image]);

        try {
            list = await db.asyncActionDB(sql);
            if (list.length === 0) {
                res.json({
                    "status": 102,
                })
                return
            }
        } catch {
            res.json({
                "status": 0
            })
            return
        }

        sql = ' DELETE FROM `alert` WHERE image = ? ';
        sql = tool.format(sql, [params.image]);

        try {
            await db.asyncActionDB(sql);
        } catch {
            res.json({
                "status": 0
            })
            return
        }

        tool.deleteImage(params.image);

        res.json({
            "status": 1
        })
        return
    },
};