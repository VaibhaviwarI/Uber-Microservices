const userModel = require('../model/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {StatusCodes} = require('http-status-codes')
const blacklistModel = require('../model/blacklist.model')

 async function register(req,res){

    try{

        const {name,email,password} = req.body;

        const user = await userModel.findOne({email})

        if(user){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message : "User With this email already exists",
                success : false,
            })
        }

        const hash = await bcrypt.hash(password,10)
        const newUser = new userModel({
           name,
           email,
           password : hash
        })

        await newUser.save();

        const token = jwt.sign({id: newUser._id},process.env.JWT_SECRET, {expiresIn: '1h'});


        res.cookie('token',token);

        res.status(StatusCodes.CREATED).json({
            message: "User Registered successfully",
            success : true
        })


    }catch(error){
        console.log("Error on creating the user")

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message : "Something Went wrong while creating the user",
            success : false
        })
    }

}


async function logIn(req,res){

    try{

    const {email,password} = req.body;

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message : "User with this email does not exists",
            success : false
        })
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message : "Username or Password is wrong",
            success : false
        })
    }

    const token = jwt.sign({
        id: user._id,
        email : user.email
    },process.env.JWT_SECRET, {expiresIn: '1d'});

    res.cookie('token',token)


    return res.status(StatusCodes.OK).json({
        message : "User successfully logged in",
        success : true
    })

}catch(error){
    console.log("Error in logging in the user",error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message : "Something went wrong while logging in the user",
        success : false
    })
}



}


async function logOut(req,res){

    const {token} = req.cookies;

    await blacklistModel.create({token,
        expiresAt : new Date(Date.now() + 24*60*60*1000)
    })

    res.clearCookie('token')

    return res.status(StatusCodes.OK).json({
        message : "User successfully logged out",
        success : true
    })

}

async function profile(req,res){

    try{
        res.send(req.user)
    }catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message
        })
    }


}

module.exports = {register,logIn,logOut,profile}