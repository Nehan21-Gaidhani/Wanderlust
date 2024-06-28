const express = require("express")
const router= express.Router()
const User =  require("../models/user.js")
const passport = require("passport")
// const {saveRedirectUrl} = require("../app.js")

const saveRedirectUrl = (req,res,next) =>
    {
        if(req.session.redirectUrl)
            {
                res.locals.redirectUrl=req.session.redirectUrl
            }
            next()
    }
//signup
router.get("/signup",(req,res)=>
    {
        res.render("users/signup.ejs")
    })
    router.post("/signup",  async(req,res)=>
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

 //login
router.get("/login",(req,res)=>
    {
        res.render("users/login.ejs")
    })
router.post("/login", saveRedirectUrl ,passport.authenticate("local",{
          failureRedirect:"/login",
          failureFlash:true,

    }), async(req,res)=>
    {  req.flash("success" ,"Welcome to Wanderlust ")
        let redirectUrl = res.locals.redirectUrl || "/listings"
       res.redirect(redirectUrl)
    })

//logout 
router.get("/logout",(req,res,next)=>
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
    
module.exports = router