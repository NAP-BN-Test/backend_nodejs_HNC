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

const port = process.env.PORT || 1598

server.listen(port, function () {
    console.log('http://localhost:' + port);
});