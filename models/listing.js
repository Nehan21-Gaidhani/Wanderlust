const mongoose=require("mongoose")
const Review = require("./review.js")
const listschema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        description:String,
        image:{
            type:String,
            set : (v) => v === "" ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW-lXuIwTb8jE7GF1ENt16ltbUiOOBtZ1Bxg&s" : v ,
            default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW-lXuIwTb8jE7GF1ENt16ltbUiOOBtZ1Bxg&s"
        },
        price:Number,
        location:String,
        country:String,
        reviews:[{
            type:mongoose.Schema.Types.ObjectId ,
            ref:"Review"
        }],
        owner:{
           type:mongoose.Schema.Types.ObjectId ,
            ref:"User"
        }
    }
)

listschema.post("findOneAndDelete",async(list)=>
{
    if(list)
        {
           await Review.deleteMany({_id: {$in : list.reviews}})
        }
})

const List = mongoose.model("List",listschema)
module.exports = List