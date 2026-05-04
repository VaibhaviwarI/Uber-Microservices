const captainModel = require('../model/captain.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {StatusCodes} = require('http-status-codes')
const blacklistModel = require('../model/blacklist.model')
const {subscribeToQueue,publishToQueue} = require("../services/rabbit")

async function register(req,res){

    try{

        const {name,email,password} = req.body;

        const captain = await captainModel.findOne({email})

        if(captain){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message : "captain With this email already exists",
                success : false,
            })
        }

        const hash = await bcrypt.hash(password,10)
        const newcaptain = new captainModel({
           name,
           email,
           password : hash
        })

        await newcaptain.save();

        const token = jwt.sign({id: newcaptain._id},process.env.JWT_SECRET, {expiresIn: '1h'});


        res.cookie('token',token);

        delete newcaptain._doc.password;

        res.status(StatusCodes.CREATED).json({
            message: "captain Registered successfully",
            success : true,
            token,
            newcaptain
        })


    }catch(error){
        console.log("Error on creating the captain")

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "Something Went wrong while creating the captain",
            success : false
        })
    }

}


async function logIn(req,res){

    try{

    const {email,password} = req.body;

    const captain = await captainModel.findOne({email})

    if(!captain){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message : "captain with this email does not exists",
            success : false
        })
    }

    const isMatch = await bcrypt.compare(password,captain.password)

    if(!isMatch){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message : "captainname or Password is wrong",
            success : false
        })
    }

    const token = jwt.sign({
        id: captain._id,
        email : captain.email
    },process.env.JWT_SECRET, {expiresIn: '1d'});

    res.cookie('token',token)

    delete captain._doc.password;

    return res.status(StatusCodes.OK).json({
        message : "captain successfully logged in",
        success : true,
        token,
        captain
    })

}catch(error){
    console.log("Error in logging in the captain",error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message : "Something went wrong while logging in the captain",
        success : false
    })
}



}


async function logOut(req,res){

    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        await blacklistModel.create({token,
            expiresAt : new Date(Date.now() + 24*60*60*1000)
        })

        res.clearCookie('token')

        return res.status(StatusCodes.OK).json({
            message : "captain successfully logged out",
            success : true
        })
    } catch(error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "Something went wrong while logging out",
            success : false
        })
    }
}

async function profile(req,res){

    try{
        res.send(req.captain)
    }catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message
        })
    }


}

async function toggleAvailability(req,res){

    try{

        const captain = await captainModel.findById(req.captain._id);
        captain.isAvailable = !captain.isAvailable
        await captain.save();
        res.send(captain);

    }catch(error){
        res.status(500).json({
            message : error.message
        })
    }

}


//jese hi new-ride queue me kuch bhi data ayega (ride/ride.controller se) ye function execute hoga aur data ko print karega
subscribeToQueue("new-ride",(data)=>{
    console.log("New Ride Request Received in Captain Service:");
    console.log(JSON.parse(data));
})


module.exports = {register,logIn,logOut,profile,toggleAvailability}