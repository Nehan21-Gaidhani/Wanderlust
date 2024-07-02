const express = require("express")
const router= express.Router()
const wrapasync=require("../utils/wrapasync.js")
const Myerror = require("../utils/ExpressError.js")
const {listingschema,reviewschema} = require("../schema.js")
const List = require("../models/listing.js")
// const {isLoggedin} = require("../app.js")

const multer = require("multer")
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage});

const isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    next();
};

const validatelisting = (req, res, next) => {
    let { error } = listingschema.validate(req.body);
    if (error) {
        next(new Myerror(400, error));
    } else {
        next();
    }
};

//index route
router.get("/",wrapasync(async (req,res)=>
    {
      const alllists= await List.find({})
      req.flash("success","New list added successfully")
      res.render("listings/index.ejs",{alllists })
    }))
    
 //create route       
    router.get("/new",isLoggedin ,(req,res)=>             //pehle likha show ke kyunki error ara tha id aur new mei confusion hora tha server ko
        {   
            res.render("listings/new.ejs")
           
        })
    
//show route
    router.get("/:id", wrapasync(async (req, res, next) => {
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
    
    
    //create new
    router.post("/", isLoggedin ,upload.single("listing[image]"),validatelisting,wrapasync(async (req, res) => 
        {   
            let url =req.file.path
            let filename=req.file.filename
        const { title, description, image, price, location,category, country } = req.body.listing;
    
        const newlist = new List({
            title,
            description,
            image,
            price,
            location,
            country,
            category,
            owner: req.user._id
        });
        console.log(category)
        newlist.image={url,filename}
        await newlist.save();
        req.flash("success", "New list added successfully");
        res.redirect("/listings");
    }));
    
    
    
//edit route
    router.get("/:id/edit",isLoggedin ,wrapasync(async(req,res)=>
    {    let {id} = req.params
         let list = await List.findById(id)
         if (!list) {
            req.flash("error", "Listing does not exist");
            return res.redirect("/listings");
        }
        res.render("listings/edit.ejs",{list})
    }))
    const methodoverride = require("method-override")
    router.use(methodoverride("_method"))
    router.put("/:id",upload.single("listing[image]"),validatelisting, wrapasync(async(req, res) => {
      
        const { id } = req.params;
       
        const { title, description, image, price, location, category,country } = req.body.listing;
        
       const list= await List.findByIdAndUpdate(id, {
            title,
            description,
            image,
            price,
            location,
            category,
            country
        });
       if(typeof req.file != "undefined"){
        let url =req.file.path
        let filename=req.file.filename
        list.image ={url ,filename}
         await list.save()
       }
        req.flash("success","Edited successfully")
        res.redirect(`/listings/${id}`);
    }));
    
    
 //delete route
    router.delete("/:id",isLoggedin,wrapasync(async (req,res)=>
    {
        let {id}= req.params
        await List.findByIdAndDelete(id)
        req.flash("success","Deleted successfully")
        res.redirect("/listings")
    }))
    

    router.get("/category/:category", async (req, res) => {
        const { category } = req.params;
        const lists = await List.find({ category });
        res.render("listings/cat.ejs", { lists });
    });
    module.exports = router
    