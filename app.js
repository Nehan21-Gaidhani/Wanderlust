const express = require("express")
const app = express()
let port = 8080
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

const store = MongoStore.create(
    {
        mongoUrl:"mongodb+srv://nehangaidhani39:QDGDXPAvyeulcAJl@cluster0.g4dztku.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        crypto:{
            secret: "mysupersecretcode",

        },
        touchAfter:24*3600,
    }
)
store.on("error",(err)=>
{
    console.log("Error in mongo session",err)
})
const sessionoptions={
    store,
    secret: "mysecretsupercode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 7 * 24  * 60 *60 *1000,
        mxAge:7 * 24  * 60 *60 *1000,
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
await mongoose.connect("mongodb+srv://nehangaidhani39:QDGDXPAvyeulcAJl@cluster0.g4dztku.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
}
app.listen(port,(req,res)=>
{
    console.log("Server connected")  
})




const validatelisting = (req, res, next) => {
    let { error } = listingschema.validate(req.body);
    if (error) {
        next(new Myerror(400, error));
    } else {
        next();
    }
};

//signup
app.get("/signup",(req,res)=>
{
    res.render("users/signup.ejs")
})
app.post("/signup", async(req,res)=>
{
   try {
    let{username,email,password} = req.body
   const newuser =new User( {username,email})
  const reguser= await User.register(newuser,password)
   req.login(reguser,(err)=>
{
    if(err)
        {
            return next (err)
        }
        req.flash("success" ,"User was registered")
        res.redirect("/listings")
})
  
}
   catch(e)
   {
    req.flash("error",e.message)
    res.redirect("/signup")
   }
})

//savedRedirectUrl
let saveRedirectUrl = (req,res,next) =>
    {
        if(req.session.redirectUrl)
            {
                res.locals.redirectUrl=req.session.redirectUrl
            }
            next()
    }
 //isloggedin middleware
 const isLoggedin = (req,res,next)=>
    {
        if(!req.isAuthenticated())
            {
                req.session.redirectUrl=req.originalUrl
                req.flash("error","you must be logged in")
               return  res.redirect("/login")
    
            }
            next()
    }

//login
app.get("/login",(req,res)=>
    {
        res.render("users/login.ejs")
    })
app.post("/login", saveRedirectUrl ,passport.authenticate("local",{
          failureRedirect:"/login",
          failureFlash:true,

    }), async(req,res)=>
    {  req.flash("success" ,"Welcome to Wanderlust ")
        let redirectUrl = res.locals.redirectUrl || "/listings"
       res.redirect(redirectUrl)
    })



//logout 
app.get("/logout",(req,res,next)=>
{
  req.logout((err)=>
{
    if(err)
        {
            return next(err)
        }
        req.flash("success","you are logged out!")
        res.redirect("/listings")
    })
})

//index route
app.get("/",wrapasync(async (req,res)=>
{
  const alllists= await List.find({})
  req.flash("success","New list added successfully")
  res.render("listings/index.ejs",{alllists })
}))

//create route       
app.get("/listings/new",isLoggedin ,(req,res)=>             //pehle likha show ke kyunki error ara tha id aur new mei confusion hora tha server ko
    {   
        res.render("listings/new.ejs")
    })

//show route
app.get("/listings/:id", wrapasync(async (req, res, next) => {
    let { id } = req.params;
    const list = await List.findById(id)
    .populate({
        path:"reviews",
        populate:{
        path:"author"
    }
}).populate("owner");
    if (!list) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { list });
}));



app.post("/listings", validatelisting, wrapasync(async (req, res) => {
    const { title, description, image, price, location, country } = req.body.listing;
    const newlist = new List({
        title,
        description,
        image,
        price,
        location,
        country,
        owner: req.user._id
    });
    await newlist.save();
    req.flash("success", "New list added successfully");
    res.redirect("/listings");
}));



//edit route
app.get("/listings/:id/edit",isLoggedin ,wrapasync(async(req,res)=>
{    let {id} = req.params
     let list = await List.findById(id)
     if (!list) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{list})
}))
const methodoverride = require("method-override")
app.use(methodoverride("_method"))
app.put("/listings/:id",validatelisting, wrapasync(async(req, res) => {
    const { id } = req.params;
    const { title, description, image, price, location, country } = req.body;
    await List.findByIdAndUpdate(id, {
        title,
        description,
        image,
        price,
        location,
        country
    });
    req.flash("success","Edited successfully")
    res.redirect(`/listings/${id}`);
}));


//delete route
app.delete("/listings/:id",wrapasync(async (req,res)=>
{
    let {id}= req.params
    await List.findByIdAndDelete(id)
    req.flash("success","Deleted successfully")
    res.redirect("/listings")
}))



//review
const validatereview = (req, res, next) => {
    let { error } = reviewschema.validate(req.body);
    if (error) {
        next(new Myerror(400, error));
    } else {
        next();
    }
};

let isReviewAuthor =async (req,res,next)=>
    {
       let {id,reviewid} = req.params
       let review = await Review.findById(reviewid)
       if(!review.author.equals(res.locals.curUser._id))
        {
            req.flash("error","You are not author of this review")
           return res.redirect(`/listings/${id}`)
        }
        next()
    }
app.post("/listings/:id/reviews", isLoggedin,validatereview, wrapasync(async (req, res, next) => {
    const { id } = req.params;
    let listre = await List.findById(id)
    const newreview = new Review(req.body.review);
    newreview.author=req.user._id
    listre.reviews.push(newreview);
    await newreview.save();
    await listre.save();
    req.flash("success","Review added successfully")
    res.redirect(`/listings/${listre._id}`);
}));

app.delete("/listings/:id/reviews/:reviewid",isLoggedin,isReviewAuthor,wrapasync(async(req,res)=>
{
   let {id,reviewid} = req.params
   await List.findByIdAndUpdate(id,{$pull : {reviews:reviewid}})
   await Review.findByIdAndDelete(reviewid)

   res.redirect(`/listings/${id}`)
})
)
app.use((err,req,res,next)=>

{   console.error(err); 
    let {status=500,message="something is wrong"} = err
    res.status(status).render("error.ejs",{err})
})

app.get('/favicon.ico', (req, res) => res.status(204));



app.all("*",(req,res,next)=>
    {
        next(new Myerror(400,"Page not found"))
    })
    