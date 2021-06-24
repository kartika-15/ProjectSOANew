const exp= require('express');
const db = require('../database');
const jwt = require("jsonwebtoken");

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
        if(email == null || pass == null || nama == null){
            conn.release();
            return res.status(404).json({
                status : 404,
                error : "Masukan inputan dengan benar"
            })
        }
        let q = await db.executeQuery(conn, `
            INSERT INTO user VALUES ('${email}', '${pass}', '${nama}','N', '${api}')
        `);

        const hasil = {
            email : email,
            nama : nama,
            api_key : api
        };

        return res.status(201).json({
            status : 201,
            message : "Berhasil Register",
            result : hasil
        });
    }
});

route.get('/login', async function (req, res) {
    let email = req.body.email;
    let pass = req.body.password;
    let epas = 'admin';
    let api = genAPIKey(10);
    
    let conn = await db.getConn();
    let check = await db.executeQuery(conn, `
        SELECT * FROM user WHERE email='${email}' and password = '${pass}'
    `);

    if(check.length > 0){
        conn.release();
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
        return res.status(404).json({
            status : 404,
            message : "Email / Password salah"
        });
    }
});



module.exports = route;