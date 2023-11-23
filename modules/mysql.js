require('dotenv').config()

const mysql = require('mysql');

const pool = mysql.createPool({
    host: process.env.DB_SERVER_HOST,
    user: process.env.DB_SERVER_USER,
    password: process.env.DB_SERVER_PASSWORD,
    database: process.env.DB_SERVER_DATABASE,
    waitForConnections : true,
    // 連線池可建立的總連線數上限(預設上限10個連線數)
    connectionLimit : 10
})

module.exports = {
    actionDB: (res , sql) => {
        pool.getConnection(function (err, connection) {

            if (err) throw err

            connection.query(sql, function (err, result) {
                if (err) throw err
                // release the connection
                connection.release()

                res.json(result)
            })
        })
    },

    asyncActionDB: (sql) => {
        return new Promise((resolve, reject) => {
            pool.getConnection(function (err, connection) {

                if (err) reject(err)
    
                connection.query(sql, function (err, result) {
                    if (err) reject(err)
                  
                    connection.release()
                  
                    resolve(result)
                })
            })
        });
    }
};
