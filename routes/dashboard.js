const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");
const { isLoggedIn } = require("../middleware");
const Booking = require("../models/booking");
const { userBookingHistory } = require("../controllers/dashboard");

// GET /dashboard
router.get("/", isLoggedIn, dashboardController.ownerDashboard);

// POST /dashboard/availability/:id
router.post("/availability/:id", isLoggedIn, dashboardController.setAvailability);

//delet booking request
router.delete("/booking/:id", isLoggedIn, dashboardController.deleteBookingRequest);

//booking history
router.get("/dashboard/booking-history", isLoggedIn, userBookingHistory);



module.exports = router;
