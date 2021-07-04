const exp= require('express');
const db = require('../database');
const axios = require('axios').default;
const route = exp.Router();

//token recipe
//app_id : 0dda822b
//app_key : e372f9948b90e95d2b78ce5fd5cb85d8

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

router.get('/deskripsi', async function (req, res) {

    let id_diet = req.body.id_diet;
    let api = genAPIKey(10);
    
    let conn = await db.getConn();

    
    let check = await db.executeQuery(conn, `
        SELECT * FROM diet WHERE id_diet='${id_diet}'
    `);

    if(check.length > 0){
        conn.release();
        return res.status(400).json({
            status : 400,
            error : " Id diet tidak sesuai!"
        })
    }else {
       

        const hasil = {
            id_diet: id_diet,
           
            api_key : api
        };

        return res.status(200).json({
            status : 200,
            message : "Id diet sesuai",
            result : hasil
        });
    }


});



router.get('/deskripsidiet',async function (req, res)  {
    const q = req.query.q;
    const ingr = req.query.ingr;
    const diet = req.query.diet;
    const hasil= await axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=${q}&app_id=0dda822b&app_key=e372f9948b90e95d2b78ce5fd5cb85d8&diet=${ingr}&diet=${diet}`)
    if(Math.floor(hasil.status/100) == 2)
    {
            
            
            res.render("diet",{"hasil":hasil});
            return res.status(200).send({"hasil":hasil});
    }
    else
    {
            return res.status(500).send("Error Calling Recipe API");
    }

});

router.get('/kaloridiet', async function (req, res) {
    const q = req.query.q;
    const ingr = req.query.ingr;
    const diet = req.query.diet;
    const calories = req.query.calories;
    const hasil= await axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=${q}&app_id=0dda822b&app_key=e372f9948b90e95d2b78ce5fd5cb85d8&diet=${ingr}&diet=${diet}&calories=${calories}`)
    if(Math.floor(hasil.status/100) == 2)
    {
            
            
            res.render("diet",{"hasil":hasil});
            return res.status(200).send({"hasil":hasil});
    }
    else
    {
            return res.status(500).send("Error Calling Recipe API");
    }
});
router.get('/menubreakfast', async function(req, res) {
    const hasilbreakfast= await axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=oatmeal&app_id=0dda822b&app_key=e372f9948b90e95d2b78ce5fd5cb85d8`)
    if(Math.floor(hasilbreakfast.status/100) == 2)
    {
            
            
            res.render("menudiet",{"hasilbreakfast":hasilbreakfast});
            return res.status(200).send({"hasilbreakfast":hasilbreakfast});
    }
    else
    {
            return res.status(500).send("Error Calling Recipe API");
    } 

});
router.get('/menulunch', async function(req, res) {
    const hasillunch= await axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=chicken&app_id=0dda822b&app_key=e372f9948b90e95d2b78ce5fd5cb85d8`)
    if(Math.floor(hasillunch.status/100) == 2)
    {
            
            
            res.render("menudiet",{"hasillunch":hasillunch});
            return res.status(200).send({"hasillunch":hasillunch});
    }
    else
    {
            return res.status(500).send("Error Calling Recipe API");
    } 

});
router.get('/menudinner', async function(req, res) {
    const hasildinner= await axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=scallop&app_id=0dda822b&app_key=e372f9948b90e95d2b78ce5fd5cb85d8`)
    if(Math.floor(hasildinner.status/100) == 2)
    {
            
            
            res.render("menudiet",{"hasildinner":hasildinner});
            return res.status(200).send({"hasildinner":hasildinner});
    }
    else
    {
            return res.status(500).send("Error Calling Recipe API");
    } 

});
//BREAKFAST : OATMEAL
//LUNCH: CHICKEN
//DINNER: SCALLOP

route.put('/like/:id_diet', async function(req, res) {
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
            if(q[0].tipe == "P" || q[0].email == "emailcoba1@gmail.com"){
                let check = await db.executeQuery(conn, `
                    SELECT * FROM like_diet WHERE email_user='${q[0].email}' AND id_diet='${req.params.id_diet}'
                `);

                if(check.length > 0){
                    let q2 = await db.executeQuery(conn, `
                        DELETE FROM like_diet WHERE email_user='${q[0].email}' AND id_diet='${req.params.id_diet}'
                    `);
                    
                    conn.release();
                    return res.status(200).json({
                        status: 200,
                        message: "unLike Done!"
                    });
                }else {
                    let q2 = await db.executeQuery(conn, `
                        INSERT INTO like_diet VALUES ('${req.params.id_diet}', '${q[0].email}')
                    `);
                    
                    conn.release();
                    return res.status(201).json({
                        status: 201,
                        message: "Like Done!"
                    });
                }
            }else {
                conn.release();
                return res.status(401).json({
                    status: 401,
                    error: "You dont have access to this!"
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
});

route.put('/fav/:id_diet', async function(req, res) {
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
            if(q[0].tipe == "P" || q[0].email == "emailcoba1@gmail.com"){  
                let check = await db.executeQuery(conn, `
                    SELECT * FROM fav_diet WHERE email_user='${q[0].email}' AND id_diet='${req.params.id_diet}'
                `);

                if(check.length > 0){
                    let q2 = await db.executeQuery(conn, `
                        DELETE FROM fav_diet WHERE email_user='${q[0].email}' AND id_diet='${req.params.id_diet}'
                    `);
                    
                    conn.release();
                    return res.status(200).json({
                        status: 200,
                        message: "unFavorite Done!"
                    });
                }else {
                    let q2 = await db.executeQuery(conn, `
                        INSERT INTO fav_diet VALUES ('${req.params.id_diet}', '${q[0].email}')
                    `);
                    
                    conn.release();
                    return res.status(201).json({
                        status: 201,
                        message: "Favorite Done!"
                    });
                }
            }else {
                conn.release();
                return res.status(401).json({
                    status: 401,
                    error: "You dont have access to this!"
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
});

route.post('/addrecipe/:id_diet', async function(req, res) {
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
            if(q[0].tipe == "P" || q[0].email == "emailcoba1@gmail.com"){
                let check = await db.executeQuery(conn, `
                    SELECT * FROM diet WHERE id_diet='${req.params.id_diet}'
                `);
    
                if(check.length > 0){
                    if(check[0].email_user == q[0].email){
                        let recipe = req.body.id_recipe;
                        let jadwal = req.body.jadwal;
    
                        let q2 = await db.executeQuery(conn, `
                            INSERT INTO isi_diet VALUES ('${req.params.id_diet}', '${recipe}', ${jadwal})
                        `);
    
                        let saat = "";
                        if(jadwal == 0) saat = "Pagi";
                        else if(jadwal == 1) saat = "Siang";
                        else if(jadwal == 2) saat = "Malam";
    
                        const hasil = {
                            id_diet: req.params.id_diet,
                            id_recipe: recipe,
                            jadwal: saat
                        }
                        conn.release();
    
                        return res.status(201).json({ 
                            status: 201,
                            result: hasil
                        });
                    }else {
                        conn.release();
                        return res.status(401).json({
                            status: 401,
                            error: "You dont have access to this!"
                        });
                    }
                }else {
                    conn.release();
                    return res.status(404).json({
                        status: 404,
                        error: "diet is not found!"
                    });
                }
            }else {
                conn.release();
                return res.status(401).json({
                    status: 401,
                    error: "You dont have access to this!"
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
});

module.exports = route;
