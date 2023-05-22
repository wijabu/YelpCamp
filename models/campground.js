const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/dzdhxeg5n/image/upload/v1683901457/YelpCamp/xc2tfzqdteuh524p51p2.png

const ImageSchema = new Schema({
    url: String,
    filename: String
})

//define a "virtual" property, which has a callback function
ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200");
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);


//////////////VIRTUAL

//define a "virtual" property, which has a callback function
CampgroundSchema.virtual("properties.popUpMarkup").get(function() {
    // return this.url.replace("/upload", "/upload/w_200");
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a>
    </strong><p>${this.description.substring(0,80)}</p>`;
})

//////////////MIDDLEWARE

CampgroundSchema.post("findOneAndDelete", async function(doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
//////////////MIDDLEWARE


// Export 
module.exports = mongoose.model("Campground", CampgroundSchema)