const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.ownerDashboard = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id });

    // All bookings in system with related data
    const allBookings = await Booking.find({})
      .populate("listing")
      .populate("user");

    //Bookings made by other users for this owner's listings
    const ownerBookings = allBookings.filter(
      booking => booking.listing && booking.listing.owner.equals(req.user._id)
    );

    // Bookings made by the owner (if owner also booked someone else's listing)
    const ownerOwnBookings = await Booking.find({ user: req.user._id }).populate("listing");

    res.render("dashboard/index.ejs", {
      listings,
      bookings: ownerBookings,
      ownBookings: ownerOwnBookings // pass this as a separate variable
    });
  } catch (err) {
    console.error("Error loading owner dashboard:", err);
    res.redirect("/");
  }
};



module.exports.setAvailability = async (req, res) => {
  const { id } = req.params;
  let { availableDates } = req.body;

  //let { availableDates } = req.body;

if (!Array.isArray(availableDates)) {
  if (availableDates && availableDates.includes(",")) {
    availableDates = availableDates.split(",").map(d => d.trim());
  } else {
    availableDates = availableDates ? [availableDates] : [];
  }
}


  const dateArray = availableDates
  .map(d => new Date(d))
  .filter(d => !isNaN(d));

  


  await Listing.findByIdAndUpdate(id, { availableDates: dateArray });

  req.flash("success", "Availability saved");
  res.redirect("/dashboard");
};




//delete booking request

module.exports.deleteBookingRequest = async (req, res) => {
  const { id } = req.params;
  await Booking.findByIdAndDelete(id);
  req.flash("success", "Booking request deleted successfully.");
  res.redirect("/dashboard");
};


//booking history

module.exports.userBookingHistory = async (req, res) => {
  try {
    // Find bookings where current user is the one who booked
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");

    res.render("dashboard/bookingHistory", { bookings });
  } catch (err) {
    console.error("Error loading booking history:", err);
    res.redirect("/dashboard");
  }
}; 


module.exports.userDashboard = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("dashboard/bookingHistory.ejs", { bookings }); // Show user's own booking history
  } catch (err) {
    console.error("Error in user dashboard:", err);
    res.redirect("/dashboard");
  }
};
