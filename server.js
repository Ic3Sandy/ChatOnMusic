'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
// require('./line');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.set('json spaces', 10);

let p_in = 0;
let p_out = 0;

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
        res.json({ 'status': 'Not Found DevEUI_uplink' });
    };
    if (!('payload_parsed' in req.body.DevEUI_uplink)) {
        res.json({ 'status': 'Not Found payload_parsed' });
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
        res.json({ 'status': 'Not Found temperature or humidity' });
    }
    else {
        db.receiveDataSensor(data);
        let status = { 'status': 'Success receiveDataSensor!' };
        res.json(status);
    };
});

app.get('/lineMsg', async (req, res) => {

    let data = await db.lineMessaging();
    let msg;

    if (data.length === 0) {
        msg = {
            "Status": "Not exist Data"
        };
    }
    else {

        let info = data[data.length - 1];
        msg = {
            'Temperature': info.temperature,
            'Humidity': info.temperature,
            'p_in': info.p_in,
            'p_out': info.p_out,
            'Timestamp': info.timestamp,
        };

    }

    res.json(msg);

});

app.post('/receiveDataBeacon', (req, res) => {

    console.log(req.body);
    let beacon = req.body.beacon;

    if (beacon.status === 'enter') p_in++;
    else if (beacon.status === 'leave') p_out++;

    let data = {
        'p_in': p_in,
        'p_out': p_out,
        'timestamp': beacon.datetime,
    };

    db.receiveDataBeacon(data);
    let status = { 'status': 'Success receiveDataBeacon!' };
    res.json(status);

});

app.get('/receiveDataBeacon', async (req, res) => {

    let data = await db.lineBeacon();
    let msg;
    
    // console.log(data.length);
    if (data.length === 0) {
        msg = {
            p_in: 0,
            p_out: 0,
        };
    }
    else {
        let info = data[data.length - 1];
        msg = {
            p_in: info.p_in,
            p_out: info.p_out,
        };
    }

    res.json(msg);

});


app.listen(port, () => {
    console.log(`Server start on port ${port}!`);
});