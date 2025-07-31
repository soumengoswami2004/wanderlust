const express =require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
//const{listingSchema,reviewSchema}=require("../Schema.js");
const Listing=require("../models/listing.js");
const {isLoggedIn}=require("../middleware.js")
const listingController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });


const Booking = require("../models/booking");
const dashboardController = require("../controllers/dashboard");
const bookingController = require("../controllers/listings");
const {isAdmin } = require("../middleware.js");
const {isOwner } = require("../middleware");



// INDEX
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single("listing[image]"), wrapAsync(listingController.createListing));



// NEW ROUTE [FOR CREATING THE NEW FORM FOR POST]
router.get("/new", isLoggedIn, listingController.renderNewForm);


// //image
// router.post("/", isLoggedIn, upload.single("listing[image]"), wrapAsync(listingController.createListing));

//CREATE [CREATE THE NEW POST]
router.post("/", isLoggedIn, wrapAsync(listingController.createListing));

// SHOW [SHOW THE ALL POST]
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT [EDIT THE DATA IN THE POST]
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEditForm));

// UPDATE [UPDATE THE DATA IN THE POST]
router.put("/:id", isLoggedIn, upload.single("listing[image]"), wrapAsync(listingController.updateListing));


// DELETE [DELETE THE POST]
router.delete("/:id", wrapAsync(listingController.deleteListing));

//BOOKING 
router
  .route("/:id/book")
  .get(isLoggedIn, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const availableDates = listing.availableDates || [];
    res.render("listings/book", { listing, availableDates });
  }))
  .post(isLoggedIn, wrapAsync(listingController.bookListing));


// Show confirmation page after booking
router.get("/:id/confirmation", isLoggedIn, wrapAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("user listing");
  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/listings");
  }
  res.render("bookings/confirmation", { booking });
}));


//pdf 
router.get("/booking/:id/download-pdf", isLoggedIn, bookingController.downloadBookingPDF);





// Owner edit form
const listings = require("../controllers/listings"); 

router.get("/:id/editowner", isLoggedIn, isOwner, listingController.renderEditFormByOwner);

// Owner update route
router.put("/:id/owner-update", isLoggedIn, isOwner, upload.single("image"), wrapAsync(listingController.updateListingByOwner));



module.exports = router;


