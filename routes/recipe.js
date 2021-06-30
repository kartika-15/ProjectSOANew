const exp= require('express');
const db = require('../database');
const route = exp.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,'./uploads');
    },
    filename:async function(req,file,callback){
        const extension = file.originalname.split('.')[file.originalname.split('.').length-1];
        let conn = await db.getConn()
        let select = await db.executeQuery(conn,`select * from recipe`)
        let id = ''
        if(select.length<10){
            id ='RE00'+ (select.length+1)
        }else if(select.length < 100){
            id ='RE0'+(select.length+1)
        }else{
            id ='RE'+(select.length+1)
        }
        const filename =  id;
        callback(null,(filename+'.'+extension));
    }
});

function checkFileType(file,cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(file.originalname.split('.')[file.originalname.split('.').length-1]);
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null,true);
    }else{
        cb(error = 'Error : Image Only!');
    }
}

const upload = multer({
    storage:storage,
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
});


route.get('/all', async function (req,res){
    let conn = await db.getConn()
    let api = req.body.api_key
    let checkAPI = await db.executeQuery(conn, `select * from user where api_key = '${api}'`)
    if(checkAPI[0] == null){
        res.status(404).send({msg:"API tidak valid"})
    }else{
        let select = await db.executeQuery(conn,`select * from recipe `)
        res.status(200).send({select})
    }
})

route.post('/new', upload.single('foto_recipe'),async function (req,res){
    let conn = await db.getConn()
    let api = req.body.api_key
    let email = req.body.email
    let nama = req.body.nama_recipe
    let tipe = req.body.tipe_diet
    let checkEmail = await db.executeQuery(conn,`select * from user where email = '${email}'`)
    let checkAPI = await db.executeQuery(conn, `select * from user where api_key = '${api}'`)
    let dir = './uploads/'+req.file.filename;
    if(checkEmail[0] == null){
        res.status(404).send({msg:"Email user tidak ada"})
    }
    if(checkAPI[0] == null){
        res.status(404).send({msg:"API tidak valid"})
    }else{
        let select = await db.executeQuery(conn,`select * from recipe`)
        let id = ''
        if(select.length<10){
            id ='RE00'+ (select.length+1)
        }else if(select.length < 100){
            id ='RE0'+(select.length+1)
        }else{
            id ='RE'+(select.length+1)
        }
        let q = await db.executeQuery(conn, `
            INSERT INTO recipe VALUES ('${id}', '${email}', '${nama}',0,${tipe}, '${dir}')
        `);
        const hasil = {
            id: id,
            email: email,
            nama: nama,
            kalori: 0,
            tipe: tipe,
        };

        res.status(201).send({hasil})
    }
})
route.post('/add_bahan', upload.single('foto_recipe'),async function (req,res){
    let conn = await db.getConn()
    let api = req.body.api_key
    let id_recipe = req.body.id_recipe
    let jumlah = req.body.jumlah
    let nama = req.body.nama_bahan
    let satuan = req.body.satuan
    let checkAPI = await db.executeQuery(conn, `select * from user where api_key = '${api}'`)
    let checkRecipe = await db.executeQuery(conn, `select * from recipe where id_recipe = '${id_recipe}'`)
    // return res.send(resultGet.data['calories']+"")
    if(checkRecipe[0] == null){
        res.status(404).send({msg:"id_recipe tidak ada"})
    }
    if(checkAPI[0] == null){
        res.status(404).send({msg:"API tidak valid"})
    }else{
        let select = await db.executeQuery(conn,`select * from bahan`)
        let id = ''
        if(select.length<10){
            id ='BN00'+ (select.length+1)
        }else if(select.length < 100){
            id ='BN0'+(select.length+1)
        }else{
            id ='BN'+(select.length+1)
        }
        
        let q = await db.executeQuery(conn, `
            INSERT INTO bahan VALUES ('${id}','${id_recipe}', '${nama}', '${jumlah}',${satuan})
        `);
        let querySearch = 'https://api.edamam.com/api/nutrition-data?app_id=fcf84afe&app_key=cb2c4e1180b131a4b79eb3bb0fa9caf5%09&nutrition-type=logging&ingr='+nama
        const axios = require("axios")
        let resultGet = await axios.get(querySearch)
        let total_kal = checkRecipe[0].kalori + resultGet.data['calories']
        let update = await db.executeQuery(conn,`UPDATE recipe SET kalori = ${total_kal} where id_recipe = '${id_recipe}'`)
        conn.release()
        const hasil = {
            id: id,
            nama: nama,
            jumlah: jumlah,
            satuan: satuan,
            "======Re":"sep======",
            nama_recipe: checkRecipe[0].nama_recipe,
            kalori: total_kal
        };
        res.status(201).send({hasil})
    }
})
module.exports = route;
