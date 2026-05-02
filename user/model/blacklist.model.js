const mongoose = require('mongoose')

const blacklistSchema = new mongoose.Schema({

    token : {
        type : String,
        required : true
    }

})

const blacklistModel = new mongoose.model('blacklist',blacklistSchema)

module.exports = blacklistModel