const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const dashboardRoutes = require("./routes/dashboard");
if(process.env.NODE_ENV != "production"){
require("dotenv").config();
}
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");



//ALL ROUTES
const listingsRouter = require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js")
const userRouter=require("./routes/user.js");

//const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

//session

const store =MongoStore.create({
   mongoUrl:dbUrl,
   crypto:{
    secret:process.env.SECRET,
   },
   touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
})

const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
};





app.use(session(sessionOption));




app.get("/", (req, res) => {
  res.redirect("/listings");
});



//USER AUTHENTICATION[LOG IN /SIGN UP]
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//flash
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser=req.user;
    next();
});



//FOR ALL LISTING [ROUTER-LISTING.JS]
app.use("/listings",listingsRouter);

//FOR ALL REVIEW [ROUTER-REVIEW.JS]
app.use("/listings/:id/reviews",reviewsRouter);

//user dashboard
app.use("/dashboard", dashboardRoutes);

//FOR ALL USER AUTHENTICATION[ROUTER-USER.JS]
app.use("/",userRouter);


const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);






app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{err});
});




app.listen(8080,()=>{
    console.log("server is listening to port 8080")
});








