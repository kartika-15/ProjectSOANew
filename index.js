const exp = require('express');
const mysql = require('mysql');
const sqlConnection= require('express-myconnection');

const app = exp();
const lRoute = {
    user : require('./routes/user'),
    recipe : require('./routes/recipe'),
    diet : require('./routes/diet'),
    admin : require('./routes/admin'),
};

app.use(exp.urlencoded({ extended: true }));



app.use('/api/user', lRoute.user);
app.use('/api/recipe', lRoute.recipe);
app.use('/api/diet', lRoute.diet);
app.use('/api/admin', lRoute.admin);
app.get('/', async function (req, res) {
    res.status(201).send({msg:"Hallo"})
});
const port = process.env.PORT || 3000

app.listen(port, function() {console.log(`Love You ${port}`)});


