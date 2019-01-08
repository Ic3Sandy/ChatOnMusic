'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.set('json spaces', 10);

app.get('/', (req, res) => {

    let result = {
        "ststus": "ok",
        "msg": "This is a GET."
    };

    console.log(result);
    res.json(result);

});

app.get('/listUsers', (req, res) => {

    let result = require('./users.json');

    console.log(result);
    res.json(result);

});


app.get('/showbyID/:id', (req, res) => {

    let data = require('./users.json');
    let id = req.params.id;
    
    let result = data[id];

    console.log(result);
    res.json(result);

});

app.post('/addUser', (req, res) => {

    let user = req.body;
    let result = require('./users.json');

    result[user.id] = user;

    fs.writeFile('users.json', JSON.stringify(result, null, 4), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });

    console.log(result);
    res.json(result);

});

app.post('/addMultiUser', (req, res) => {

    let users = req.body;
    let result = require('./users.json');
    let id = 0;

    for (let i in result) {
        id++;
    };

    for (let i in users) {
        users[i]["id"] = ++id;
        result[id] = users[i];
    };

    fs.writeFile('users.json', JSON.stringify(result, null, 4), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });

    console.log(result);
    res.json(result);

});

app.delete('/deleteUser/:id', (req, res) => {

    let data = require('./users.json');
    let id = req.params.id;
    let result = {};

    for (let i in data) {
        if (i !== id)
            result[i] = data[i];
    };

    fs.writeFile('users.json', JSON.stringify(result, null, 4), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });

    console.log(result);
    res.json(result);

});


app.get('/*', function(req, res){
    res.status(404).send({"message": "Doesn't have this path!!!"});
});

app.listen(port, () => {
    console.log(`Server start on port ${port}!`);
});