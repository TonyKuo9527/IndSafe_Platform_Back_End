require('dotenv').config();

const line = require('@line/bot-sdk');
const fs = require('fs');


const { Validator } = require('node-input-validator');
const { v1: uuidv1, v4: uuidv4 } = require('uuid');

const { Parser }    = require('json2csv');

const db = require('./mysql');
const lineNotify = require('./notify');

const config = {
    channelAccessToken: process.env.channel_AccessToken,
    channelSecret: process.env.channel_Secret
};

const client = new line.Client(config);

module.exports = {
    handleEvent: async (event) => {
        if (event.type !== 'message' || event.message.type !== 'text') {
            // ignore non-text-message event
            return Promise.resolve(null);
        } else {
            // create a echoing text message
            let echo;
            let urlList = [];
            let result = [];

            if (event.message.text.includes("'") || event.message.text.includes('"') || event.message.text.includes('`')) {
                echo = {
                    type: 'text',
                    text: '請勿輸入特殊字元'
                };
            } else {
                switch (event.message.text) {
                    case '註冊':
                        try {
                            echo = [{
                                "type": "flex",
                                "altText": "This is a Flex Message",
                                "contents": {
                                    "type": "bubble",
                                    "header": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "註冊",
                                                "margin": "md",
                                                "size": "xxl",
                                                "weight": "bold"
                                            },
                                            {
                                                "type": "text",
                                                "text": "選擇欲註冊的場域"
                                            }
                                        ]
                                    },
                                    "body": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "contents": [
                                            {
                                                "type": "button",
                                                "height": "sm",
                                                "style": "primary",
                                                "action": {
                                                    "type": "uri",
                                                    "label": "註冊 ",
                                                    "uri": process.env.REGISTER_URL,
                                                },
                                            }
                                        ],
                                    }
                                }
                            }];
                        } catch {
                            echo = {
                                type: 'text',
                                text: '資料庫錯誤，請聯繫管理員'
                            }
                        };
                        break;

                    case '訂閱':
                        echo = {
                            type: 'text',
                            text: '請指定要訂閱的場域'
                        }
                        break;

                    case '系統':
                        echo = [{
                            "type": "flex",
                            "altText": "This is a Flex Message",
                            "contents": {
                                "type": "bubble",
                                "header": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "系統",
                                            "margin": "md",
                                            "size": "xxl",
                                            "weight": "bold"
                                        },
                                        {
                                            "type": "text",
                                            "text": "點選按鈕前往系統"
                                        }
                                    ]
                                },
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "button",
                                            "action": {
                                                "type": "uri",
                                                "label": "系統",
                                                "uri": process.env.HTTPS_URL
                                            },
                                            "height": "sm",
                                            "style": "primary"
                                        }
                                    ],
                                }
                            }
                        }];
                        break;

                    default:
                        msg = event.message.text;

                        if (msg.indexOf('訂閱') > -1) {
                            channelName = msg.replace('訂閱', '');
                            try {
                                result = await db.asyncActionDB('SELECT * FROM `channel`');
                                result.forEach(item => {
                                    let url = lineNotify.getAuthLink(item.id, event.source.userId);
                                    if (item.channelName == channelName) {
                                        urlList.push(
                                            {
                                                "type": "button",
                                                "action": {
                                                    "type": "uri",
                                                    "label": "訂閱 " + item.channelName,
                                                    "uri": url,
                                                },
                                                "height": "sm",
                                                "style": "primary"
                                            }
                                        );
                                    }
                                })

                                if (urlList.length) {
                                    echo = [{
                                        "type": "flex",
                                        "altText": "This is a Flex Message",
                                        "contents": {
                                            "type": "bubble",
                                            "header": {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "訂閱清單",
                                                        "margin": "md",
                                                        "size": "xxl",
                                                        "weight": "bold"
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "點選按鈕訂閱"
                                                    }
                                                ]
                                            },
                                            "body": {
                                                "type": "box",
                                                "layout": "vertical",
                                                "spacing": "sm",
                                                "contents": urlList,
                                            }
                                        }
                                    }];
                                } else {
                                    echo = {
                                        "type": "text",
                                        "text": "目前沒有訂閱服務"
                                    }
                                }

                                break;
                            } catch {
                                echo = {
                                    type: 'text',
                                    text: '資料庫錯誤，請聯繫管理員'
                                }
                            };

                        }

                        break;
                };
            };

            // use reply API
            return client.replyMessage(event.replyToken, echo);
        }
    },

    format: (sql, values) => {
        if (typeof sql !== "string") return "Error";
        if (typeof values !== "object") return "Error";

        let newSQL = "";
        let value;

        for (let i = 0; i < sql.length; ++i) {
            if (sql[i] === "?") {
                if (values.length === 0) return "Error";

                value = values.shift();

                if (value == null) {
                    newSQL += value
                } else {
                    newSQL += `"` + value + `"`;
                }

                if (sql[i + 1] === "?") {
                    ++i;
                }
            } else {
                newSQL += sql[i];
            }
        }

        return newSQL;
    },

    checkType: (data, rule) => {
        return new Promise((resolve) => {
            const v = new Validator(data, rule);

            v.check().then((matched) => {
                if (!matched) {
                    resolve({
                        "status": 101,
                        "data": v.errors
                    });
                } else {
                    resolve({
                        "status": 1,
                    });
                }
            });
        })
    },

    checkString: (data) => {
        return new Promise((resolve) => {
            Object.keys(data).forEach((key) => {
                if (data[key].includes("'") || data[key].includes('"') || data[key].includes('`')) {
                    resolve(false);
                }
            });
            resolve(true);
        });
    },

    formatDate: (date, fmt) => {
        var o = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    },

    getToDay(day) {
        let today = new Date();
        return new Date(today.setDate(today.getDate() + day));
    },

    deleteImage: (image) => {
        return new Promise((resolve) => {
            fs.unlink(process.env.SAVE_PATH + image, (err) => {
                resolve(true);
            });
        });
    },

    save_image: (base64, name) => {
        return new Promise((resolve, reject) => {
            let base64Data = base64.replace(/^data:image\/jpeg;base64,/, "");
            fs.writeFile(process.env.SAVE_PATH + name, base64Data, 'base64', function (err) {
                if (err) {
                    reject(false);
                } else {
                    resolve(true);
                };
            });
        });
    },

    save_csv: (name ,fields, data) => {
        return new Promise((resolve ,reject) => {
            const parser = new Parser({
                fields,
                withBOM: true // 支援utf-8
            });

            const csv = parser.parse(data);

            fs.writeFile(process.env.SAVE_LOG_PATH + name, csv, (err) => {
                if (err) {
                    reject();
                } else {
                    resolve();
                }
            });
        });
    },

};