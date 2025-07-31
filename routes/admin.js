
const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin,isSuperAdmin } = require("../middleware");
const Listing = require("../models/listing");
const User = require("../models/user");
const ApprovalHistory = require("../models/approvalHistory");

// Show pending posts to approve/reject
module.exports.dashboard = async (req, res) => {
    const pendingListings = await Listing.find({ isApproved: null }).populate("owner");

    res.render("admin/dashboard", { listings:pendingListings });
};

//save history
const saveHistory = async (propertyTitle, status, admin, listingId) => {
  await ApprovalHistory.create({
    propertyTitle,
    status,
    adminUsername: admin.username,
    adminEmail: admin.email,
    listing: listingId, // Add this line
  });
};


// Approve Listing
router.post("/listings/:id/approve", isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { isApproved: true });

  // Save history
  if (listing) {
    await saveHistory(listing.title, "approved", req.user, listing._id);

  }

  req.flash("success", "Property approved successfully");
  res.redirect("/admin/dashboard");
});

// Reject Listing
router.post("/listings/:id/reject", isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const listing = await Listing.findByIdAndUpdate(id, {
    isApproved: false,
    isRejected: true,
    rejectionMessage: message,
  });

  // Save history
  if (listing) {
    await saveHistory(listing.title, "rejected", req.user, listing._id);

  }

  req.flash("success", "Property rejected successfully");
  res.redirect("/admin/dashboard");
});



// Block user
router.post("/users/:id/block", isLoggedIn, isAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
  req.flash("success", "User blocked successfully");
  res.redirect("/admin/dashboard");
});

//  Unblock user
router.post("/users/:id/unblock", isLoggedIn, isAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
  req.flash("success", "User unblocked successfully");
  res.redirect("/admin/dashboard");
});


// created time
router.get("/admin/users", async (req, res) => {
  const users = await User.find({});

  // Get count of approved posts per user
  const postCounts = await Listing.aggregate([
    { $match: { isApproved: true } },
    { $group: { _id: "$owner", count: { $sum: 1 } } }
  ]);

  // Make a lookup map
  const countMap = {};
  postCounts.forEach(item => {
    countMap[item._id.toString()] = item.count;
  });

  const usersWithPostCount = users.map(user => {
    return {
      ...user.toObject(),
      postCount: countMap[user._id.toString()] || 0
    };
  });

  res.render("admin/users", { users: usersWithPostCount });
});




//make admin 

router.post("/create-new-admin", isAdmin, async (req, res) => {
  const { username, email, password, mobile } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already exists. Try a different email.");
      return res.redirect("/admin/dashboard");
    }

    const newUser = new User({
      username,
      email,
      mobile,
      isAdmin: true,
      role: "admin",
    });

    const registeredUser = await User.register(newUser, password);

    req.flash("success", "New admin created successfully!");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.log(err);
    req.flash("error", "Failed to create admin. Try a different email or username.");
    res.redirect("/admin/dashboard");
  }
});


//show admin
router.get("/dashboard", isLoggedIn, isAdmin, async (req, res) => {
  const listings = await Listing.find({ isApproved: null }).populate("owner");
  const allUsers = await User.find({});
  const admins = await User.find({ isAdmin: true });
  const history = await ApprovalHistory.find({})
  
  .sort({ date: -1 })
  .populate({
    path: "listing",
    populate: { path: "owner" }
  });



  // Get post counts
  const postCounts = await Listing.aggregate([
    { $match: { isApproved: true } },
    { $group: { _id: "$owner", count: { $sum: 1 } } }
  ]);

  const countMap = {};
  postCounts.forEach(item => {
    countMap[item._id.toString()] = item.count;
  });

  const users = allUsers.map(user => ({
    ...user.toObject(),
    postCount: countMap[user._id.toString()] || 0
  }));

  res.render("admin/dashboard", {
    users,
    listings,
    admins,
    currentUser: req.user,
    history,
  });
});


//block admin
router.post("/block/:id", isLoggedIn, isSuperAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
  res.redirect("/admin/dashboard");
});

//unblock admin
router.post("/unblock/:id", isLoggedIn, isSuperAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
  res.redirect("/admin/dashboard");
});


//delete history
router.post('/history/delete/:id', isAdmin, async (req, res) => {
  try {
    const historyId = req.params.id;
    await ApprovalHistory.findByIdAndDelete(historyId);
    req.flash('success', 'History record deleted successfully.');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting record.');
    res.redirect('/admin/dashboard');
  }
});







module.exports = router;
