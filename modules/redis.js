require('dotenv').config()

const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL
});

async function connection() {
    await client.connect();
    client.on('error', (err) => console.log('Redis Client Error', err));
}

connection();

module.exports = {
    actionDB: (command) => {
        return new Promise((resolve, reject) => {
            client.sendCommand(command)
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    },
};