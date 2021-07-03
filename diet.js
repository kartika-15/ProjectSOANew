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
        let conn = db.getConn();
        let q = await db.executeQuery(conn, `
            SELECT * FROM user WHERE api_key='${req.headers['x-auth-token']}'
        `);

        if(q.length > 0){
            let check = await db.executeQuery(conn, `
                SELECT * FROM like_diet WHERE email_user='${q[0].email}' AND id_diet='${req.params.id_diet}'
            `);

            if(check.length > 0){
                let q2 = await db.executeQuery(conn, `
                    DELETE FROM like_diet WHERE email_user='${q[0].email}' AND id_diet='${req.params.id_diet}'
                `);
            }else {
                let q2 = await db.executeQuery(conn, `
                    INSERT INTO like_diet VALUES ('${req.params.id_diet}', '${q[0].email}')
                `);
            }
        }else {
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
            let check = await db.executeQuery(conn, `
                SELECT * FROM fav_diet WHERE email_user='${q[0].email}' AND id_diet='${req.params.id_diet}'
            `);

            if(check.length > 0){
                let q2 = await db.executeQuery(conn, `
                    DELETE FROM fav_diet WHERE email_user='${q[0].email}' AND id_diet='${req.params.id_diet}'
                `);
            }else {
                let q2 = await db.executeQuery(conn, `
                    INSERT INTO fav_diet VALUES ('${req.params.id_diet}', '${q[0].email}')
                `);
            }
        }else {
            return res.status(403).json({
                status: 403,
                error: "Token Not Valid!"
            });
        }
    }
});

module.exports = route;