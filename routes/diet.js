const exp= require('express');
const db = require('../database');

const route = exp.Router();

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