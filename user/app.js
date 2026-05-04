
const dotenv = require('dotenv').config()

const express = require('express')
const connect = require('./db/db')


const cookieParser = require('cookie-parser')

const rabbitMq = require('./service/rabbit')

const app = express();


const userRoutes =  require('./routes/user.routes')


rabbitMq.connect();

connect();


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use('/',userRoutes);



module.exports = app;