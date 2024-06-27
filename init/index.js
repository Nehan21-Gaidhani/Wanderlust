const mongoose= require("mongoose")
const List = require("../models/listing.js")
const initdata = require("./data.js")
main().catch((err)=>console.log(err))

async function main()
{
   await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}

const initDB = async () =>

    {   await List.deleteMany({})
        initdata.data = initdata.data.map((obj)=>({...obj, owner:"667ab6d54ce632ee5a93da8e"}))
        await List.insertMany(initdata.data)
        console.log("deleted")
    }

initDB()    