const exp= require('express');
const db = require('../database');
const jwt = require("jsonwebtoken");
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

route.put('/update', async function (req, res) {
    let email = req.body.email;
    jwt.verify(req.header("x-auth-token"), 'minadmin', function (err, decoded) {
        if (err) {
            res.status(400).send({msg: "token tidak valid!"})
        }
        
    });
    let conn = await db.getConn();
    let select = await db.executeQuery(conn, `SELECT * FROM user WHERE email='${email}'`)
    if(email == 'null'){
        res.status(400).send({msg:"Harap isi email dengan benar"})
    }else if(select[0] == null){
        res.status(404).send({msg:"Email tidak ada"})
    }
    let update = await db.executeQuery(conn,`UPDATE user SET tipe = 'P' where email = '${email}'`)
    res.status(201).send({msg:"Berhasil diganti"})
    conn.release()
});




module.exports = route;