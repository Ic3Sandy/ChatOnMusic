'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
require('./line');

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

app.post('/receiveData', async (req, res) => {

    // console.log(req.body);
    if (!('DevEUI_uplink' in req.body)) {
        res.json({'status': 'Not Found DevEUI_uplink'});
    };
    if (!('payload_parsed' in req.body.DevEUI_uplink)) {
        res.json({'status': 'Not Found payload_parsed'});
    };

    // { channel: 1,
    //     type: 103,
    //     typeString: 'Temperature Sensor',
    //     value: 27.5 }
    let frames = req.body.DevEUI_uplink.payload_parsed.frames;
    // console.log(frames);

    let temperature = null;
    let humidity = null;
    let p_in = 987654321;
    let p_out = 987654321;
    let timestamp = Date.now();

    for (let i in frames) {
        // Temperature Sensor
        if (frames[i].type === 103) {
            temperature = frames[i].value;
        }
        // Humidity Sensor
        else if (frames[i].type === 104) {
            humidity = frames[i].value;
        };
    };

    let data = {
        'temperature': temperature,
        'humidity': humidity,
        'p_in': p_in,
        'p_out': p_out,
        'timestamp': timestamp,
    };
    console.log(data);

    if (temperature === null || humidity === null) {
        res.json({'status': 'Not Found temperature or humidity'});
    }
    else {
        db.receiveDataSensor(data);
        let status = {'status': 'Success receiveData!'};
        res.json(status);
    };
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