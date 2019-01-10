const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

let SchemaTypes = mongoose.Schema.Types;
mongoose.connect('mongodb://ic3:qazxsw@202.139.192.93/sensor', { useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Open Mongoose Server!");
});

let schemaSensor = new mongoose.Schema({
    'temperature': SchemaTypes.Double,
    'humidity': SchemaTypes.Double,
    'p_in': Number,
    'p_out': Number,
    'timestamp': Date,
});

let schemaBeacon = new mongoose.Schema({
    'p_in': Number,
    'p_out': Number,
    'timestamp': Date,
});

let schemaSanam = new mongoose.Schema({
    'day': Date,
    'value': [String],
});

let SensorData = mongoose.model('SensorData', schemaSensor);
let BeaconData = mongoose.model('BeaconData', schemaBeacon);
let SanamData = mongoose.model('SanamData', schemaSanam);

let receiveDataSensor = (data) => {

    let result = new SensorData({
        'temperature': data.temperature,
        'humidity': data.humidity,
        'p_in': data.p_in,
        'p_out': data.p_out,
        'timestamp': data.timestamp,
    });

    result.save((err, res) => {
        if (err) return console.error(err);
        else console.log(res)
    });

};

let putSanam = (data) => {

    let result = new BeaconData({
        'p_in': data.p_in,
        'p_out': data.p_out,
        'timestamp': data.timestamp,
    });

    result.save((err, res) => {
        if (err) return console.error(err);
        else console.log(res)
    });

};

let addNewDay = (data) => {

    let result = new SanamData({
        'day': data.day,
        'value': data.value,
    });

    result.save((err, res) => {
        if (err) return console.error(err);
        else console.log(res)
    });

};

let updateSanam = (data) => {

    SanamData.updateOne({ 'day': data.day }, { 'value': data.value }, (err, res) => {
        if (err) return console.error(err);
        else {
            console.log(res);
            if (res.n === 0) {
                addNewDay(data);
            }
        };
    });

};

let lineMessaging = async () => {

    return SensorData.find({}, (err, data) => {
        if (err) return console.error(err);
        // else console.log(data);
        return data;
    });

};

let checkPerson = async () => {

    return BeaconData.find({}, (err, data) => {
        if (err) return console.error(err);
        // else console.log(data);
        return data;
    });

};

let readSanam = async () => {

    return SanamData.find({}, (err, data) => {
        if (err) return console.error(err);
        // else console.log(data);
        return data;
    });

};

let showData = async () => {

    return SensorData.find({}, (err, data) => {
        if (err) return console.error(err);
        else console.log(data);
        return data;
    });

};

let editData = (data) => {

    Temp.updateMany({ 'teamID': data.teamID }, { 'temp': data.temp }, (err, res) => {
        if (err) return console.error(err);
        else console.log(res);
    });

};

let deleteData = (data) => {

    Temp.deleteMany({ 'teamID': data.teamID }, (err, res) => {
        if (err) return console.error(err);
        else console.log(res);
    });
};


module.exports.receiveDataSensor = receiveDataSensor;
module.exports.putSanam = putSanam;
module.exports.lineMessaging = lineMessaging;
module.exports.checkPerson = checkPerson;
module.exports.addNewDay = addNewDay;
module.exports.updateSanam = updateSanam;
module.exports.readSanam = readSanam;


// let result = new Temp({ 'teamID': 11, 'temp': '23.6' });

// result.save(function (err, fluffy) {
//     if (err) return console.error(err);
//     else console.log("Saved!")
// });

