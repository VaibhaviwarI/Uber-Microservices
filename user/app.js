
const dotenv = require('dotenv').config()

const express = require('express')
const connect = require('./db/db')


const cookieParser = require('cookie-parser')

const app = express();


const userRoutes =  require('./routes/user.routes')

connect();


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use('/',userRoutes);



module.exports = app;