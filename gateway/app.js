const express = require('express')
const expressProxy = require('express-http-proxy')

const app = express()


app.use('/user', expressProxy('http://localhost:3001'))
//3001 per user service chal rhi hai , ab koi bhi route /user ka aayega to wo user-service pr phuch jaegi

app.use('/captain', expressProxy('http://localhost:3002'))

app.use('/ride', expressProxy('http://localhost:3003'))


app.listen(3000,()=>{
    console.log("Gateway server listening on PORT 3000")
})






