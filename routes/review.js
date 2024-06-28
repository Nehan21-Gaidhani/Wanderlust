const express = require("express")
const router= express.Router({mergeParams:true})
const wrapasync=require("../utils/wrapasync.js")
const Myerror = require("../utils/ExpressError.js")
const {listingschema,reviewschema} = require("../schema.js")
const Review =  require("../models/review.js")
const List = require("../models/listing.js")
// const {isLoggedin} = require("../app.js")

//review
const validatereview = (req, res, next) => {
    let { error } = reviewschema.validate(req.body);
    if (error) {
        next(new Myerror(400, error));
    } else {
        next();
    }
};
const isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    next();
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
router.post("/", isLoggedin,validatereview, wrapasync(async (req, res, next) => {
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

router.delete("/:reviewid",isLoggedin,isReviewAuthor,wrapasync(async(req,res)=>
{
   let {id,reviewid} = req.params
   await List.findByIdAndUpdate(id,{$pull : {reviews:reviewid}})
   await Review.findByIdAndDelete(reviewid)

   res.redirect(`/listings/${id}`)
})
)

module.exports= router