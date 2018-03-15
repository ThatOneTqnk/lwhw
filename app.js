var express = require('express');
var request = require('request');
var app = express();
var path = require('path');
var PORT = process.env.PORT || 5000;



app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('pages/index');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))