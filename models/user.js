const mongoose=require("mongoose")
const passportLM = require("passport-local-mongoose")

const userschema = new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
        }
    }
)

userschema.plugin(passportLM)

const User = mongoose.model("User",userschema)

module.exports = User