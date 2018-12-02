//模块载入方式为单例模式
//https://segmentfault.com/a/1190000006912853

const mysql = require('mysql');
const config = require('../config');
const pool = mysql.createPool({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

//connection.query values自动转义
let query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err)
            }
            connection.query(sql, values, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result.affectedRows)
                }
                connection.release()
            })
        })
    })
};

let queryWithID = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err)
            }
            connection.query(sql, values, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result.insertId)
                }
                connection.release()
            })
        })
    })
};

let getRows = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err)
            }
            connection.query(sql, values, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
                connection.release()
            })
        })
    })
};

let close = function () {
    pool.end();
};

let startTransaction = async function () {
    //获取链接
    let getConn = ()=>{
        return new Promise((resolve, reject) => {
            pool.getConnection(function (err, connection) {
                if (err) {
                    reject(err)
                }
                resolve(connection)
            })
        })
    }
    let conn = await getConn()
    //console.log(conn)
    //启动事务
    let startTransaction = ()=>{
        return new Promise((resolve, reject) => {
            conn.beginTransaction(function (err) {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
    }
    await startTransaction()
    return {
        conn: conn,
        rollbackFlag:false,
        rollback: function () {
            //   console.log("________________rollback________________")
            this.rollbackFlag = true
            return new Promise((resolve, reject) => {
                this.conn.rollback(function (err) {
                    if (err)  reject(err)
                    resolve(true)
                });
            })
        },
        query: function (sql, values) {
            return new Promise((resolve, reject) => {
                this.conn.query(sql, values, async (err, result) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                })
            })
        },
        release: async function () {
            //主动滚回
            if (!this.rollbackFlag){
                await this.rollback()
            }
            this.conn.release()
        },
        commit: function () {
            this.rollbackFlag = true
            return new Promise((resolve, reject) => {
                this.conn.commit(async function (err) {
                    if (err) {
                        reject(err)
                    }
                    resolve(true)
                })
            })
        },
    }
}


module.exports = {query,queryWithID, getRows, close, startTransaction};
