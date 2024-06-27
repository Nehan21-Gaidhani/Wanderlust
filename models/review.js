const mongoose=require("mongoose")

const reviewschema = new mongoose.Schema(
    {
       
        rating:{
            type:Number,
            min:1,
            max:5,

        },
        comment:String,
        created_at:{type:Date,
        default:Date.now ()},
        author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    }
)

const Review = mongoose.model("Review",reviewschema)
module.exports = Review