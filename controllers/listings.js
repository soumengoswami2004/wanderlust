const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const Booking = require("../models/booking");

const User = require("../models/user");

module.exports.index = async (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query;
  
  let query = {
    isApproved: true,
    
  };

  if (category) query.category = category;
  if (search) query.location = new RegExp(search, 'i');
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }

  const listings = await Listing.find(query);

  res.render("listings/index", {
    listings,
    category,
    search,
    minPrice,
    maxPrice,
  });
};




module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    newListing.isApproved = null;
    await newListing.save();
    req.flash("success", "Listing submitted for admin approval");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if( typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};






// Book a listing
module.exports.bookListing = async (req, res) => {
  const { id } = req.params;
  const { dateRange } = req.body;

  if (!dateRange || !dateRange.includes("to")) {
    req.flash("error", "Please select both check-in and check-out dates.");
    return res.redirect(`/listings/${id}/book`);
  }

  const [checkInRaw, checkOutRaw] = dateRange.split("to");
  const checkIn = new Date(checkInRaw.trim());
  const checkOut = new Date(checkOutRaw.trim());
  const listing = await Listing.findById(id);
  const pricePerDay = listing.price;

  const timeDiff = checkOut - checkIn;
  const numberOfDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

  const totalAmount = pricePerDay * numberOfDays


  const booking = new Booking({
    listing: id,
    user: req.user._id,
    checkIn,
    checkOut,
    totalAmount
  });

  await booking.save();
  req.flash("success", "Booking request submitted!");
   res.redirect(`/listings/${booking._id}/confirmation`);
};


//render book listing
module.exports.renderBookingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const availableDates = listing.availableDates || [];
  console.log("Available Dates:", availableDates);

  res.render("listings/book", {
    listing,
    availableDates
  });
};


//download pdf
const PDFDocument = require("pdfkit");

module.exports.downloadBookingPDF = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("user listing");

  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/listings");
  }

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=booking-details.pdf");
  
  doc.pipe(res);

  doc.fontSize(20).text("Booking Confirmation", { align: "center" });
  doc.moveDown();
  doc.text(`Username: ${booking.user.username}`);
  doc.text(`Listing: ${booking.listing.title}`);
  doc.text(`Check-in: ${booking.checkIn.toDateString()}`);
  doc.text(`Check-out: ${booking.checkOut.toDateString()}`);
  doc.text(`Total Amount:${booking.totalAmount} `);
  
  
  doc.end();
};
module.exports.updateListingByOwner = async (req, res) => {
    const { id } = req.params; 

    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }

    // Find and update listing with form data
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Update image if new one is uploaded
    if (typeof req.file !== "undefined") {
        const { path: url, filename } = req.file;
        listing.image = { url, filename };
    }

    // Reset approval status
    listing.isApproved = null;
    listing.isRejected = false;
    listing.rejectionMessage = "";

    await listing.save();

    req.flash("success", "Listing updated and sent for approval.");
    res.redirect("/dashboard#approvedStatus");
};



  module.exports.renderEditFormByOwner = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/dashboard");
    }
    res.render("listings/editowner", { listing });
};









