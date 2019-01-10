// Import Library
const bodyParser = require('body-parser') // parse json, so we can call node and object
const request = require('request-promise')// networking to curl outside
const express = require('express')// wrapper we can write node js shorter
// const db = require('./db');
const app = express()
const port = process.env.PORT || 4000
const hostname = '127.0.0.1'
const SERVER = '127.0.0.1'
const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer zXHPGzdB0d6u4y8MAN6sXB13KlZXKzcqpqhp4OQEGb4dIR9IfsEAM+5NvwfUfutebYS5TTM+d2pcS3qBa6OXq+nMp3W7XQDXZxuiywNXzM+dl4jj921oHS1JyagobQ/yEmZ8jdGpXVbx8oFi2uoNEAdB04t89/1O/w1cDnyilFU='
}

app.use(bodyParser.urlencoded({ extended: false }))//initiate body parser to get json
app.use(bodyParser.json())

// Push
//get method
app.get('/webhook', (req, res) => {
    // push block
    let msg = 'Hello TESA'
    push(msg)
    res.send(msg)
})

// Reply
//post method
app.post('/webhook', async (req, res) => {
    // reply block

    let event = req.body.events[0];
    let reply_token = event.replyToken;
    console.log(event);

    if (event.replyToken === '00000000000000000000000000000000' ||
        event.replyToken === 'ffffffffffffffffffffffffffffffff') {
        res.json(200);
        // return;
    }

    else if (event) {
        switch (event.type) {

            case 'message': {
                if (event.message.type === 'sticker') {
                    reply(reply_token, 'sticker')
                }
                else if (event.message.text === 'Admin_Mon') {
                    //ขอข้อมูลจากเซิฟเวอร์เพื่อขอข้อมูล temp,humid ในปัจจุบันแล้วแสดงในไลน์
                    await request.get('http://' + SERVER + ':5000/linemsg/').then((msg) => {
                        console.log(msg);
                        reply(reply_token, msg);
                    });

                }
                else {
                    let msg = event.message.text;
                    reply(reply_token, msg);
                }
            } break;

            case 'beacon': {

                let status;

                if (event.beacon.type === 'enter') {

                    status = 'enter';
                    await request.get('http://' + SERVER + ':5000/checkPerson/').then((result) => {
                        
                        result = JSON.parse(result);
                        let p_in = result.p_in;
                        let p_out = result.p_out;

                        if (p_in > p_out + 2) {
                            msg = "จํานวนคนเกิน กรุณาเชิญคนออกจากบริเวณ!!!";
                            reply(reply_token, msg);
                        }
                        else
                            reply(reply_token, "@Beacon Enter");

                    });
                }

                else if (event.beacon.type === 'leave') {
                    status = 'leave';
                    reply(reply_token, "@Beacon Leave");
                }

                let timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                let data = {
                    'beacon': {
                        'datetime': timestamp,
                        'status': status,
                    }
                };

                request.post({
                    url: 'http://' + SERVER + ':5000/putSanam',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }, (err, res, body) => {
                    console.log(body);
                })

            };
        };
    };
});

let push = (msg) => {
    let body = JSON.stringify({ //change into json string
        // push body
        to: 'U40b342ba953ff9b5d3c31e1ba3afdaad',
        messages: [
            {
                type: 'text',
                text: msg
            }
        ]
    }, null, 4)
    // curl
    curl('push', body)
}

let reply = (reply_token, msg) => {
    let body = JSON.stringify({
        // reply body
        replyToken: reply_token,
        messages: [
            {
                type: 'text',
                text: msg
            }
        ]
    })
    // curl
    curl('reply', body)
}

//body neeed to be JSON//method: reply,push
let curl = (method, body) => {
    request.post({
        url: 'https://api.line.me/v2/bot/message/' + method,
        headers: HEADERS,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode)
    })
};

app.listen(port, hostname, () => {
    console.log(`Server Line running at http://${hostname}:${port}/`)
})
