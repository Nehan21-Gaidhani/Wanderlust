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
            url:String,
            filename:String,
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
        },
        category: {
            type: String,
            required: true,
            enum: ['rooms', 'mountains', 'pools', 'villa', 'arctic', 'beach', 'farms', 'lake', 'island','houseboats','camping','tropical','desert','treehouse','luxe','cities']
          },
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