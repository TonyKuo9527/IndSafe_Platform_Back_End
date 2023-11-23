const tool = require('../modules/tool');

module.exports = {
    autoReply: (req, res) => {
        Promise
            .all(req.body.events.map(tool.handleEvent))
            .then(result => {
                res.json(result);
            })
            .catch(err => {
                res.status(500).end()
            })
    }
};