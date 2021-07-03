const mysql= require('mysql');
//connect ke mysql pakai pool
// const pool= mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });
const pool= mysql.createPool({
    host: 'freedb.tech',
    user: 'freedbtech_mico',
    password: 'Michael454.',
    database: 'freedbtech_projectSoa'
});

const getConn= () => {
    try {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                else resolve(conn)
            });
        });
    } catch (error) {
        console.log(error);
    }
};

const executeQuery= (conn, query) => {
    try {
        return new Promise((resolve, reject) => {
            conn.query(query, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports= {
    'getConn': getConn,
    'executeQuery': executeQuery
};