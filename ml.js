const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const request = require('request-promise');
const SERVER = '127.0.0.1';
// require('@tensorflow/tfjs-node-gpu');

let dataset;

let xtrain = [];
let ytrain = [];
let xtest = [];
let ytest = [];
let MAX = 0;

async function prepareData() {


    for (let i = 0; i < dataset.length - 2; i++) {

        // let time = 0;
        if (ytrain.length !== 7950) {
            xtrain.push([(i%24)]);
            ytrain.push([dataset[i], dataset[i + 1], dataset[i + 2]]);
        }
        else {
            xtest.push([(i%24)]);
            ytest.push([dataset[i], dataset[i + 1], dataset[i + 2]]);
        }

    };
    // console.log(xtrain);
    // console.log(ytrain);
    // console.log(xtest.length);
    // console.log(ytest.length);

};

const model = tf.sequential();

// let hidden1 = tf.layers.lstm({ 
//     units: 100, 
//     inputShape: [6, 1], 
//     returnSequences: false 
// });
let hidden1 = tf.layers.dense({
    units: 20,
    inputShape: [1],    
    kernelInitializer: 'VarianceScaling',
    activation: 'sigmoid'
});
model.add(hidden1);

let hidden2 = tf.layers.dense({
    units: 10, 
    kernelInitializer: 'VarianceScaling',
    activation: 'sigmoid'
});
model.add(hidden2);

// let hidden2 = tf.layers.dropout({rate: 0.3});
// model.add(hidden2);

let output = tf.layers.dense({
    units: 3,
    kernelInitializer: 'VarianceScaling',
    activation: 'relu'
});
model.add(output);



const LEARNING_RATE = 0.01;
// const optimizer = tf.train.adadelta(LEARNING_RATE, 0.1);
const optimizer = tf.train.sgd(LEARNING_RATE);

model.compile({
    optimizer: optimizer,
    loss: 'meanSquaredError',
    metrics: ['accuracy'],
});

async function main() {

    async function trainModel() {
        const history = await model.fit(
            trainXS,
            trainYS,
            {
                batchSize: 32, // จำนวนข้อมูลที่คิดในแต่ละครั้ง
                epochs: 100,//จนรอบ
                shuffle: true,
                validationSplit: 0.2 // แยกเป็น Val
            });
    };

    let trainXS = tf.tensor2d(xtrain);
    let trainYS = tf.tensor2d(ytrain);

    for (let i = 0; i < 5; i++)
        await trainModel();

    // await model.save('file://model');

    // const load = async () => {
    //     const model = 
    // };

    // load();
    let model1 = await tf.loadModel('file://model/model.json');
    let testXS = tf.tensor2d([[23]]);


    model1.predict(testXS).data().then((res) => {
        console.log(res[0]*MAX, res[1]*MAX, res[2]*MAX);
    });

    console.log('numTensors: ' + tf.memory().numTensors);
    tf.disposeVariables();
    console.log('numTensors: ' + tf.memory().numTensors);
};


// readCSV().then((data) => {
//     main();
// });
request.get('http://' + SERVER + ':5000/getSanam?hours=8000').then((msg) => {

    msg = JSON.parse(msg);
    console.log(msg.number_of_tourist.length);
    let numberOfTourist = msg.number_of_tourist;

    for (let i in numberOfTourist) {
        numberOfTourist[i] = parseInt(numberOfTourist[i]);
        if (numberOfTourist[i] > MAX) MAX = numberOfTourist[i];
    };
    console.log("MAX: " + MAX);
    const a = tf.tensor1d(numberOfTourist);
    const b = tf.tensor1d([MAX]);
    const abNorm = a.div(b);

    dataset = abNorm.reverse();
    // prepareData();
    dataset.data().then(async (res) => {
        dataset = res;
        // console.log(dataset);
        await prepareData();
        await main(); 
    });

});

