const exp = require('express');
const mysql = require('mysql');
const sqlConnection= require('express-myconnection');

const app = exp();
const lRoute = {
    user : require('./routes/user'),
    recipe : require('./routes/recipe'),
    diet : require('./routes/diet'),
};

app.use(exp.urlencoded({ extended: true }));

app.use(sqlConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'project_soa_diet'
}, 'pool'));

app.use('/api/user', lRoute.user);
app.use('/api/recipe', lRoute.recipe);
app.use('/api/diet', lRoute.diet);

app.listen(3000, function() {console.log('Love You 3000')});


