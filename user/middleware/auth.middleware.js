const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {StatusCodes} = require('http-status-codes')
const userModel = require('../model/user.model')
const blacklistModel = require('../model/blacklist.model')


async function userAuth(req,res,next){

    try{

    const token = req.cookies?.token || req.authorization.header.split(' ')[ 1 ]


    if(!token){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message : "No token provided",
            success : false
        })
    }

    const isBlacklisted = await blacklistModel.findOne( {token} )

    if(isBlacklisted){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message : "Already logged out",
            success : false
        })
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET)

    return res.status(StatusCodes.OK).json({
        message : "Profile Data",
        user : decoded
    })

}catch(error){
    return res.status(StatusCodes.UNAUTHORIZED).json({
        message : "Something went wrong",
        success : false
    })
}

    next();


}


module.exports = {
    userAuth
}