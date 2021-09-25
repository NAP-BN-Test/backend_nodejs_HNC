var session = require('express-session')

let app = require('express')();
let server = require('http').createServer(app);
let cors = require('cors');
const path = require('path');
const express = require('express');
const multer = require('multer');
var upload = multer();
const bodyParser = require('body-parser')
const Sequelize = require('sequelize');


app.use(session({
    name: 'user_sid',
    secret: '00a2152372fa8e0e62edbb45dd82831a',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000,
        maxAge: 3000000,
        sameSite: true,
        secure: true,
        httpOnly: true
    }
}))

app.use(cors())
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
app.use(bodyParser.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: false }));


let routes = require('./api/router') //importing route
routes(app)

let connect = require('./api/database')

connect.connectDatabase();

// test zalo
var ZaloSocial = require('zalo-sdk').ZaloSocial;

var zsConfig = {
    appId: '2568387362160739467',
    secretkey: 'BXRLx82AGrl2gBRoWDcN'
};
var ZSClient = new ZaloSocial(zsConfig);
app.get('/zalo', function (req, res) {
    ZSClient.api('me/friends', function (response) {
        console.log('response', response);
        res.json(response);
    });
})
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------

const port = process.env.PORT || 3401

server.listen(port, function () {
    console.log('http://localhost:' + port);
});