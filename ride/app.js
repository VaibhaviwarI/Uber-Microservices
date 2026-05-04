require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express()
const connect = require('./db/db')

const rideRoutes = require('./routes/ride.routes')
const rabbitMq = require('./service/rabbit')

rabbitMq.connect();

connect();

app.use(express.json());
app.use(express.urlencoded( {extended:true} ))

app.use(cookieParser());

app.use('/',rideRoutes);


module.exports = app;