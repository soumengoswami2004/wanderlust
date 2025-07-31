const review = require("./models/review");
const Review = require("./models/review");
const Listing = require("./models/listing"); 

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.method === "GET") {
            req.session.redirectUrl = req.originalUrl;
        }
        req.flash("error", "You must be logged in to do that");
        return res.redirect("/login");
    }
    next();
};



module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    } 
    next();
};



module.exports.isReviewAuthor=async (req,res,next)=>{
    let {id,reviewId}=req.params;
    let review =await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","you are not the author of this review");
       return res.redirect(`/listings/${id}`);
    }
    next();
};


// admin
// module.exports.isAdmin = (req, res, next) => {
//   if (req.user && req.user.isAdmin) {
//     return next();
//   }
//   req.flash("error", "Access denied. Admins only.");
//   res.redirect("/login");
// };


module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin && req.session.role === "admin") {
    return next();
  }
  req.flash("error", "You are not authorized!");
  res.redirect("/login");
};



module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports.isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.isSuperAdmin) {
    return next();
  }
  req.flash("error", "You don't have permission.");
  res.redirect("/login");
};

