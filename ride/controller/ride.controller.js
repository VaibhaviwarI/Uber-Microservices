const rideModel = require('../models/ride.model')

const {subscribeToQueue,publishToQueue} = require('../service/rabbit')


module.exports.createRide = async(req,res,next) =>{

    const {pickup,destination} = req.body;

    const newRide = new rideModel({
        user : req.user._id,
        pickup,
        destination
    })

    await newRide.save();


    //new-ride ke queue ke andr newRide ki details jayegi
    publishToQueue("new-ride",JSON.stringify(newRide))
    
    res.status(201).json({
        message : "Ride Created Successfully",
        success : true,
        newRide
    })



}