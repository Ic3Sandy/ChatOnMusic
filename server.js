'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const db = require('./db');
const readCSV = require('./readCSV');

const app = express();
const port = process.env.PORT || 5000;
const schedule = require('node-schedule');

app.use(bodyParser.json());
app.set('json spaces', 4);

let p_in = 0;
let p_out = 0;
let value = [];

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
    console.log(frames);

    let temperature = null;
    let humidity = null;
    let p_in = 987654321;
    let p_out = 987654321;
    let timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    for (let i in frames) {
        // Temperature Sensor
        if (frames[i].type === 103) {
            temperature = frames[i].value;
        }
        // Humidity Sensor
        else if (frames[i].type === 104) {
            humidity = frames[i].value;
        }
        //p_in
        else if (frames[i].channel === 9) {
            p_in = frames[i].value;
        }
        //p_out
        else if (frames[i].channel === 10) {
            p_out = frames[i].value;
        }
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
        let status = { 'status': 'Success receiveDataFromSensor!' };
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

    };

    res.json(msg);

});

app.post('/putSanam', (req, res) => {

    console.log(req.body);
    let beacon = req.body.beacon;

    if (beacon.status === 'enter') p_in++;
    else if (beacon.status === 'leave') p_out++;

    let data = {
        'p_in': p_in,
        'p_out': p_out,
        'timestamp': beacon.datetime,
    };

    db.putSanam(data);
    let status = { 'status': 'Success receiveDataFromBeacon!' };
    res.json(status);

});

app.get('/checkPerson', async (req, res) => {

    let data = await db.checkPerson();
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

app.get('/getSanam', async (req, res) => {

    if (!('hours' in req.query)) {
        res.json({ 'status': 'Not Found hours in parameter' });
    };

    let hours = parseInt(req.query.hours);
    let data = await db.readSanam();
    let arrayValue = [];

    if (data.length !== 0) {
        for (let i in data) {
            arrayValue = arrayValue.concat(data[i].value);
        };
    };

    let list = await readCSV.readSanamCSV();
    arrayValue = (list.concat(arrayValue)).reverse();

    if (hours > arrayValue.length) {
        res.json({ 'status': 'Hours more then Value' });
    }
    else {

        let numberOfTourist = [];

        for (let i = 0; i < hours; i++) {
            numberOfTourist.push(arrayValue[i])
        };

        let result = {
            'number_of_tourist': numberOfTourist.reverse()
        };
    
        res.json(result);

    }

});

app.get('/predict', async (req, res) => {

    let timeNow = (new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
    let hoursNow = parseInt(timeNow.split(' ')[1].split(':')[0]) + 7;

    if (('hours' in req.query)) {
        hoursNow = parseInt(req.query.hours);
    };

    let model = await tf.loadModel('file://model/model.json');
    let testXS = tf.tensor2d([[hoursNow]]);
    let MAX = 1800

    model.predict(testXS).data().then((predict) => {

        let h1 = (parseInt(predict[0]*MAX)).toString();
        let h2 = (parseInt(predict[1]*MAX)).toString();
        let h3 = (parseInt(predict[2]*MAX)).toString();
        // console.log(h1, h2, h3);

        let result = {
            "number_of_tourist": [h1, h2, h3]
        };

        tf.disposeVariables();
        res.json(result);
    });
    

});

app.listen(port, () => {

    console.log(`Server start on port ${port}!`);
    schedule.scheduleJob('0 * * * *', async () => {

        let timeNow = (new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
        console.log('Schedule: ' + timeNow);

        // 00.00 thai
        if (timeNow.split(' ')[1] === '17:00:00') {

            let data = {
                'p_in': 0,
                'p_out': 0,
                'timestamp': timeNow,
            };
            db.putSanam(data);

            data = {
                'day': timeNow.split(' ')[0],
                'value': [0],
            };
            db.addNewDay(data);

            value = [];

        };

        let data = await db.checkPerson();
        if (data.length !== 0) {

            let info = data[data.length - 1];
            let numPerson = info.p_in - info.p_out;
            if (numPerson > 0)
                value.push(numPerson);
            else
                value.push(0)

        }
        else {
            value.push(0);
        }

        data = {
            'day': timeNow.split(' ')[0],
            'value': value,
        };

        db.updateSanam(data);

    });
});