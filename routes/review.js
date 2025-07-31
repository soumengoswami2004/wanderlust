const express =require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");


const reviewController = require("../controllers/reviews");

// CREATE REVIEW
router.post("/", isLoggedIn, wrapAsync(reviewController.createReview));

// DELETE REVIEW
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;