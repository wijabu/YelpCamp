if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const mongoose = require("mongoose");
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")
const Campground = require("../models/campground");

// const dbUrl = "mongodb://localhost:27017/yelpCamp"
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelpCamp"
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("The mongoose has landed!");
});

const sample = (array) => array[ Math.floor(Math.random() * array.length) ]

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "64662b52aa77dbe1d8e0e994",
      location: `${ cities[ random1000 ].city }, ${ cities[ random1000 ].state }`,
      title: `${ sample(descriptors) } ${ sample(places) }`,
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum repellat incidunt voluptatibus, minima distinctio dignissimos suscipit vero quasi nemo eius. Voluptatibus eos aliquid dolor rem alias? Soluta molestiae illum quisquam!",
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[ random1000 ].longitude,
          cities[ random1000 ].latitude
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dzdhxeg5n/image/upload/v1683916945/YelpCamp/azxyrsaworavmrsjffzy.png',
          filename: 'YelpCamp/avuf6tpnryslcsw5hw5t'
        },
        {
          url: 'https://res.cloudinary.com/dzdhxeg5n/image/upload/v1683656434/samples/landscapes/nature-mountains.jpg',
          filename: 'YelpCamp/sjbszc7efb4ia2pelipg'
        }
      ]
    })
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})