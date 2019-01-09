'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

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

app.post('/receiveData', (req, res) => {

    // { channel: 1,
    //     type: 103,
    //     typeString: 'Temperature Sensor',
    //     value: 27.5 }
    console.log(req.body);
    let temp = req.body.DevEUI_uplink.payload_parsed.frames[0];
    let DevEUI = (req.body.DevEUI_uplink.DevEUI).substring(14);
    // let DevEUI = 'AA00DBCA12EF1111';
    // let temp = req.body;
    let data = {
        'teamID': DevEUI,
        'temp': (temp.value).toString(),
    }
    
    db.receiveData(data);
    let status = {'status': 'success'};
    res.json(status);

});

app.get('/showData', async (req, res) => {

    let data = await db.showData();

    res.json(data);

});

app.post('/addData', (req, res) => {

    let temp = req.body;
    let data = {
        'teamID': temp.teamID,
        'temp': temp.temp,
    }
    db.receiveData(data);

    let status = {'status': 'success'};
    res.json(status);

});

app.put('/editData/:teamID', (req, res) => {

    let temp = req.body;
    let data = {
        'teamID': req.params.teamID,
        'temp': temp.temp,
    };
    db.editData(data);

    let status = {'status': 'success'};
    res.json(status);

});

app.delete('/deleteData/:teamID', (req, res) => {

    let data = {
        'teamID': req.params.teamID,
    };
    db.deleteData(data);

    let status = {'status': 'success'};
    res.json(status);

});

app.listen(port, () => {
    console.log(`Server start on port ${port}!`);
});