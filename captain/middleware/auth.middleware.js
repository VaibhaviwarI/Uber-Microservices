const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {StatusCodes} = require('http-status-codes')
const captainModel = require('../model/captain.model')
const blacklistModel = require('../model/blacklist.model')


async function captainAuth(req,res,next){

    try{
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[ 1 ];

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
        
        const captain = await captainModel.findById(decoded.id);
        if (!captain) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Captain not found",
                success: false
            })
        }
        
        req.captain = captain;
        next();

    }catch(error){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message : "Something went wrong",
            success : false
        })
    }
}


module.exports = {
    captainAuth
}