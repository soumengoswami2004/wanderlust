const mongoose = require("mongoose");

const approvalHistorySchema = new mongoose.Schema({
    
  propertyTitle: String,
  listing: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Listing"
}
,
  status: String,
  adminUsername: String,
  adminEmail: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ApprovalHistory", approvalHistorySchema);
