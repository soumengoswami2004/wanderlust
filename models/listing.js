const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");



const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    category: {
        type: String,
        enum: ['Trending', 'Rooms', 'Mountains', 'Castles', 'Pools', 'Iconic Cities', 'Farming', 'Beach', 'Lake font', 'Boating', 'Gaming'],
        required: true
    },
    facilities: [{
        type: String,
        enum: ['WiFi', 'Parking', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Air Conditioning', 'Breakfast', 'Laundry', '24/7 Reception', 'Room Service', 'Pet Friendly'],
    }],
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    availableDates: {
        type: [Date],
        default: []
      }
      ,
    isApproved: {
        type: Boolean,
        default: null
    },
    isRejected: {
        type: Boolean,
        default: false
    },
    rejectionMessage: {
  type: String,
  default: ""
}


});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});





const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;