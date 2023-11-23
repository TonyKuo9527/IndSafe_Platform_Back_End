const tool  = require('./modules/tool');

const db    = require('./modules/mysql');

const fields = ['ip', 'account', 'behavior', 'timestamp'];


(async () => {
    let data = [];

    try {
        data = await db.asyncActionDB('SELECT ip, account, behavior, DATE_FORMAT(timestamp, "%Y-%m-%d %H:%i:%s") as timestamp FROM `system_log` ORDER BY timestamp ASC');
    } catch {
        console.log('get logs error');
    };

    logs_name = tool.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss') + '.csv'

    try {
        tool.save_csv(logs_name, fields , data);
        console.log('Done');
    } catch {
        console.log('save logs error');
    };
})()