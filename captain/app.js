
const dotenv = require('dotenv').config()

const express = require('express')
const connect = require('./db/db')


const cookieParser = require('cookie-parser')

const app = express();


const captainRoutes =  require('./routes/captain.routes')
const rabbitMq = require('./services/rabbit')

rabbitMq.connect();


connect();


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use('/',captainRoutes);



module.exports = app;