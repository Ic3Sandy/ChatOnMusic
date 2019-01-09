const mongoose = require('mongoose');

mongoose.connect('mongodb://ic3:qazxsw@202.139.192.93/hwData', { useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Open Mongoose!");
});

let schemaTemp = new mongoose.Schema({
    teamID: Number,
    temp: String
});

let Temp = mongoose.model('temperature', schemaTemp);

let receiveData = (data) => {

    let result = new Temp({ 'teamID': data.teamID, 'temp': data.temp });

    result.save((err, res) => {
        if (err) 
            return console.error(err);
        else {
            console.log(res);
            // return {'status': 'success', 'data': res}
        };
    });

};

let showData = async () => {

    return Temp.find({}, (err, data) => {
        if (err) return console.error(err);
        console.log(data);
        return data;
    });

};

let editData = (data) => {

    Temp.updateMany({'teamID': data.teamID}, {'temp': data.temp}, (err, res) => {
        console.log(res);
    });

};

module.exports.receiveData = receiveData;
module.exports.showData = showData;
module.exports.editData =editData;

// let result = new Temp({ 'teamID': 11, 'temp': '23.6' });

// result.save(function (err, fluffy) {
//     if (err) return console.error(err);
//     else console.log("Saved!")
// });

