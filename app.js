 if(process.env.NODE_ENV !=="production")
    {
        require('dotenv').config()
     }
   
const express = require("express")
const app = express()
let port = 3000
const mongoose = require("mongoose")
const List = require("./models/listing.js")
const Review =  require("./models/review.js")
const Myerror = require("./utils/ExpressError.js")
const wrapasync=require("./utils/wrapasync.js")
const session=require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User =  require("./models/user.js")

const Rlistings = require("./routes/listing.js")
const Rreview = require("./routes/review.js")
const Ruser = require("./routes/user.js")

const dbUrl = process.env.ATLASDB_URL
const store = MongoStore.create(
    {
        mongoUrl:dbUrl,
        crypto:{
            secret: process.env.SECRET,

        },
        touchAfter:24*3600,
    }
)
store.on("error",()=>
{
    console.log("Error in mongo session",err)
})

const sessionoptions={
     store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 7 * 24  * 60 *60 *1000,
        maxAge:7 * 24  * 60 *60 *1000,
        httpOnly:true,
    }
}

app.use(session(sessionoptions))
app.use(flash())


app.use(passport.initialize())
app.use(passport.session())
passport.use( new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>
    {
        res.locals.success =req.flash("success")
        res.locals.error=req.flash("error")
        res.locals.curUser=req.user
        next()
    })

const {listingschema,reviewschema} = require("./schema.js")
const ejsmate= require("ejs-mate")
app.engine("ejs",ejsmate)


const path=require("path")
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

app.use(express.urlencoded({extended:true}))
 app.use(express.static(path.join(__dirname,"public")))

main().catch((err)=>console.log(err))

async function main()
{
//    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
await mongoose.connect(dbUrl)
}
app.listen(port,(req,res)=>
{
    console.log("Server connected")  
})








//savedRedirectUrl
// module.exports.saveRedirectUrl = (req,res,next) =>
//     {
//         if(req.session.redirectUrl)
//             {
//                 res.locals.redirectUrl=req.session.redirectUrl
//             }
//             next()
//     }


 //isloggedin middleware
//  module.exports.isLoggedin = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         req.session.redirectUrl = req.originalUrl;
//         req.flash("error", "You must be logged in");
//         return res.redirect("/login");
//     }
//     next();
// };






    app.use("/listings",Rlistings)
    app.use("/listings/:id/reviews",Rreview)
    app.use("/",Ruser)



app.use((err,req,res,next)=>

{   console.error(err); 
    let {status=500,message="something is wrong"} = err
    res.status(status).render("error.ejs",{err})
})

app.get('/favicon.ico', (req, res) => res.status(204));



// app.all("*",(req,res,next)=>
//     {
//         next(new Myerror(400,"Page not found"))
//     })
    