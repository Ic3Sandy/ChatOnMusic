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
    // let temp = req.body.DevEUI_uplink.payload_parsed.frames[1];
    let temp = req.body;
    let data = {
        'teamID': 11,
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

app.listen(port, () => {
    console.log(`Server start on port ${port}!`);
});