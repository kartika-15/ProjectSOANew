const exp= require('express');
const db = require('../database');
const jwt = require("jsonwebtoken");
const midtransClient = require('midtrans-client');
const { executeQuery } = require('../database');

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

let midtransCore = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: 'SB-Mid-server-QHDnXzZNidBm5Udpi4s-WHZW',
    clientKey: 'SB-Mid-client-r5PGe78t3erp3CKn'
});

async function getBill(req){
    let bill = {
        "bill": 0
    };
    let api = req.body.api_key
    let conn = await db.getConn()
    let select = await db.executeQuery(conn,`select * from user where api_key = '${api}'`)
    
    conn.release()
    if (select[0].tipe == "N") {
        if(req.body.jumlah == -99999){
            bill.bill = 10000
        }else{
            bill.bill = 100 * req.body.jumlah;
        }
        
    }
    else if(select[0].tipe == "P"){
        bill.bill = 1000;
    }
    return bill;
}

route.post("/pay/cc", async function (req, res) {
    let conn = await db.getConn()
    let checkAPI = await db.executeQuery(conn, `select * from user where api_key = '${req.body.api_key}'`)
    if(checkAPI[0] == null){
        res.status(404).send({msg:"API tidak valid"})
    }else{
        let jum = await executeQuery(conn, `select * from user where api_key = '${req.body.api_key}'`)
        conn.release();
        if(jum[0].tipe == "N"){
            const card = {
                'card_number': req.body.card_number,//'5264 2210 3887 4659',
                'card_exp_month': req.body.card_exp_month,//'12',
                'card_exp_year': req.body.card_exp_year,//'2025',
                'card_cvv': req.body.card_cvv,//'123',
                'client_key': midtransCore.apiConfig.clientKey,
            };
            const cardToken = await midtransCore.cardToken(card);
            const bill = await getBill(req);
            const parameter = {
                "payment_type": "credit_card",
                "transaction_details": {
                    "gross_amount": bill.bill,
                    "order_id": "t" + new Date().getTime(),
                },
                "credit_card":{
                    "token_id": cardToken.token_id
                }
            };
            // executeQuery(conn, `update user set last_paid = now() where api_key = '${req.body.api_key}'`);
            
            const chargeResponse = await midtransCore.charge(parameter);
            console.log(chargeResponse);
            if(chargeResponse.fraud_status == "accept"){
                
                // return res.send(jum[0].api_hit)
                let total_api = 0
                if(jum[0].tipe == "N"){
                    total_api = parseInt(jum[0].api_hit)+parseInt(req.body.jumlah)
                    if(req.body.jumlah == -99999){
                        total_api = -9999999
                        let hasil = await executeQuery(conn, `update user set last_paid = now(), api_hit = ${total_api}, tipe = 'P' where api_key = '${req.body.api_key}'`)
                        return res.status(201).send({
                            "jenis":'Upgrade user',
                            "msg": "successfully paid!",
                            api_hit :total_api
                        });
                    }
                }
                let hasil = await executeQuery(conn, `update user set last_paid = now(), api_hit = ${total_api} where api_key = '${req.body.api_key}'`)
                
                return res.status(201).send({
                    "jenis":'tambah api_hit',
                    "msg": "successfully paid!",
                    api_hit :total_api
                });
            }
            else{
                conn.release();
                return res.status(400).send({
                    "msg": "Fraud detected!"
                });
            }
        }else{
            return res.status(201).send({
                "jenis":'tambah api_hit',
                "msg": "Anda tidak perlu menambah api_hit karena premium"
            });
        }
    }
});

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
        if(email == null || pass == null || nama == null){
            conn.release();
            return res.status(404).json({
                status : 404,
                error : "Masukan inputan dengan benar"
            })
        }
        let q = await db.executeQuery(conn, `
            INSERT INTO user VALUES ('${email}', '${pass}', '${nama}','N', '${api}', 0, NULL)
        `);

        if(nama == "Dummy2"){
            const hasil = {
                email : email,
                nama : nama
            };
            conn.release();
    
            return res.status(201).json({
                status : 201,
                message : "Berhasil Register",
                result : hasil
            });
        }else {
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
    }
});

route.get('/login', async function (req, res) {
    let email = req.body.email;
    let pass = req.body.password;
    let epas = 'admin';
    
    let conn = await db.getConn();
    let check = await db.executeQuery(conn, `
        SELECT * FROM user WHERE email='${email}' and password = '${pass}'
    `);

    if(check.length > 0){
        conn.release();
        if(check[0].tipe == "P"){
            let date = new Date(check[0].last_paid)
            var day = date.getDate();
            var month = date.getMonth();
            var year = date.getFullYear();
            let now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if(diffDays > 30 && diffDays < 34){
                return res.status(200).json({
                    status : 200,
                    alert : "silahkan bayar langganan anda",
                    message : "Api Key anda = "+ check[0].api_key
                })
            }else if(diffDays>=34){
                let update = await db.executeQuery(conn,`UPDATE user SET tipe = 'N', api_hit = 0 where email = '${email}'`)
                conn.release()
                return res.status(200).json({
                    status : 200,
                    alert : "Anda telah menjadi user biasa",
                    message : "Api Key anda = "+ check[0].api_key
                })
            }
        }
        return res.status(200).json({
            status : 200,
            message : "Api Key anda = "+ check[0].api_key
        })
    }else if(email == epas && pass == epas){
        const date = new Date();
        let tgl = date.toISOString().substr(0, 4) + "/" + date.toISOString().substr(5, 2) + "/" + date.toDateString().substr(8, 2) + date.toString().substr(15, 9);
        
        let token = jwt.sign(
            {
                "login_time" : tgl,
            },
            "minadmin",{expiresIn:'1H'}
        );
        
        return res.status(200).send({"token":token});
    }
    else {
        
        conn.release()
        return res.status(404).json({
            status : 404,
            message : "Email tidak ditemukan / Password Salah"
        });
    }
});

route.put('/profile/nama', async function (req, res) {
    if(!req.headers['x-auth-token']){
        return res.status(403).json({
            status: 403,
            error: "No Token!"
        });
    }else {
        if(req.body.nama){
            let conn = await db.getConn();
            let q = await db.executeQuery(conn, `
                SELECT * FROM user WHERE api_key='${req.headers['x-auth-token']}'
            `);

            if(q.length > 0){
                let q2 = await db.executeQuery(conn, `
                    UPDATE user SET nama='${req.body.nama}' WHERE api_key='${req.headers['x-auth-token']}'
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
                conn.release();
                return res.status(403).json({
                    status: 403,
                    error: "Token Not Valid!"
                });
            }
        }
    }
});

route.put('/profile/password', async function (req, res) {
    if(!req.headers['x-auth-token']){
        return res.status(403).json({
            status: 403,
            error: "No Token!"
        });
    }else {
        if(req.body.new_pass && !req.body.old_pass){
            return res.status(403).json({
                status: 403,
                error: "Password lama tidak ada!"
            });
        }else if(!req.body.new_pass && req.body.old_pass){
            return res.status(403).json({
                status: 403,
                error: "Password baru tidak ada!"
            });
        }else {
            let conn = await db.getConn();
            let q = await db.executeQuery(conn, `
                SELECT * FROM user WHERE api_key='${req.headers['x-auth-token']}'
            `);  

            if(q.length > 0){
                if(req.body.old_pass == q[0].password){
                    let q2 = await db.executeQuery(conn, `
                        UPDATE user SET password='${req.body.new_pass}' WHERE api_key='${req.headers['x-auth-token']}'
                    `);

                    conn.release();
                    
                    return res.status(200).json({
                        status : 200,
                        message : "Berhasil Ganti Password"
                    });
                }else {
                    conn.release();
                    return res.status(403).json({
                        status: 403,
                        error: "Password Lama Salah!"
                    });
                }
            }else {
                conn.release();
                return res.status(403).json({
                    status: 403,
                    error: "Token Not Valid!"
                });
            }
        }
    }
});

route.get('/profile', async function(req, res){
    if(!req.headers['x-auth-token']){
        return res.status(403).json({
            status: 403,
            error: "No Token!"
        });
    }else {
        let conn = await db.getConn();
        let q = await db.executeQuery(conn, `
            SELECT * FROM user WHERE api_key='${req.headers['x-auth-token']}'
        `);

        if(q.length > 0){
            const hasil = {
                email: q[0].email,
                nama: q[0].nama,
                tipe: q[0].tipe,
                api_key: q[0].api_key,
                fav_recipe: [],
                fav_diet: []
            }

            let q2 = await db.executeQuery(conn, `
                SELECT * FROM fav_recipe WHERE email_user='${q[0].email}'
            `);
            
            if(q2.length > 0){
                for(let i = 0; i < q2.length; i++){
                    hasil.fav_recipe.push(q2[i].id_recipe);
                }
            }
            
            let q3 = await db.executeQuery(conn, `
                SELECT * FROM fav_diet WHERE email_user='${q[0].email}'
            `);
            
            if(q3.length > 0){
                for(let i = 0; i < q3.length; i++){
                    hasil.fav_diet.push(q3[i].id_diet);
                }
            }

            conn.release();
            return res.status(200).json({
                status: 200,
                result: hasil
            })
        }else {
            conn.release();
            return res.status(403).json({
                status: 403,
                error: "Token Not Valid!"
            });
        }
    }
});

module.exports = route;