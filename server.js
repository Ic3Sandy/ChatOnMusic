'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.set('json spaces', 10);

app.get('/', (req, res) => {

    let result = {
        "ststus": "ok",
        "msg": "This is a GET."
    };

    res.json(200).send(result);

});

app.get('/listUsers', (req, res) => {

    let json = require('./users.json');

    res.json(json);

});

app.listen(port, () => {
    console.log(`Server start on port ${port}!`);
});