const exp= require('express');
const db = require('../database');

const route = exp.Router();

const genAPIKey = (length) => {
    const alphabets= 'abcdefghijklmnopqrstuvwxyz'.split('');

    let key= '';

    for (let i= 0; i<15; i++) {
        let hash= Math.floor(Math.random()*2)+1;
        let model= Math.floor(Math.random()*2)+1;
        let randAlpha= Math.floor(Math.random()*alphabets.length);
        
        if (hash === 1) {
            key+= Math.floor(Math.random()*length);
        } else {
            if (model === 1) key+= alphabets[randAlpha].toUpperCase();
            else key+= alphabets[randAlpha]; 
        }
    }

    return key;
};

route.post('/register', async function (req, res) {
    let email = req.body.email;
    let pass = req.body.password;
    let nama = req.body.nama_user;

    let api = genAPIKey(10);
    
    let conn = await db.getConn();
    let check = await db.executeQuery(conn, `
        SELECT * FROM user WHERE email='${email}'
    `);

    if(check.length > 0){
        conn.release();
        return res.status(400).json({
            status : 400,
            error : "Email sudah terdaftar!"
        })
    }else {
        let q = await db.executeQuery(conn, `
            INSERT INTO user VALUES ('${email}', '${pass}', '${nama}','N', '${api}')
        `);

        const hasil = {
            email : email,
            nama : nama,
            api_key : api
        };
        conn.release();

        return res.status(201).json({
            status : 201,
            message : "Berhasil Register",
            result : hasil
        });
    }
});

route.put('/profile', async function (req, res) {
    if(!req.headers['x-auth-token']){
        return res.status(403).json({
            status: 403,
            error: "No Token!"
        });
    }else {
        if(!req.body.new_pass){
            let conn = db.getConn();
            let q = db.executeQuery(conn, `
                SELECT * FROM user WHERE api_key='${req.headers['x-auth-token']}'
            `);

            if(q.length > 0){
                let q2 = db.executeQuery(conn, `
                    UPDATE user SET nama='${req.body.nama}'
                `);

                const hasil = {
                    email : q[0].email,
                    nama : req.body.nama
                };
                conn.release();
                
                return res.status(200).json({
                    status : 200,
                    message : "Berhasil Ganti Nama",
                    result : hasil
                });
            }else {
                return res.status(403).json({
                    status: 403,
                    error: "Token Not Valid!"
                });
            }
        }else if(req.body.new_pass && !req.body.old_pass){
            return res.status(403).json({
                status: 403,
                error: "Password lama tidak ada!"
            });
        }else if(!req.body.new_pass && req.body.old_pass){
            return res.status(403).json({
                status: 403,
                error: "Password baru tidak ada!"
            });
        }else if(!req.body.nama){
            let conn = db.getConn();
            let q = db.executeQuery(conn, `
                SELECT * FROM user WHERE api_key='${req.headers['x-auth-token']}'
            `);  

            if(q.length > 0){
                if(req.body.old_pass == q[0].password){
                    let q2 = db.executeQuery(conn, `
                        UPDATE user SET pass='${req.body.new_pass}'
                    `);

                    conn.release();
                    
                    return res.status(200).json({
                        status : 200,
                        message : "Berhasil Ganti Password"
                    });
                }else {
                    return res.status(403).json({
                        status: 403,
                        error: "Password Lama Salah!"
                    });
                }
            }else {
                return res.status(403).json({
                    status: 403,
                    error: "Token Not Valid!"
                });
            }
        }
    }
});


module.exports = route;