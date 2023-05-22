const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
//when we initialize or when we instantiate a new Mapbox geocoding, we pass in the token. It wants it under the key of access token.
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new")
};

module.exports.createCampground = async (req, res, next) => {
    //THIS is where we would insert a JOI Schema to validate a new instance of this model against a pre-defined schema. That code was cut out and moved to its own middleware section (schemas.js)

    //Use the following to get the geolocation of the city, ST where the camp is located
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    console.log(geoData.body.features);

    //define a variable to create new instance of Model "Campground"
    const campground = new Campground(req.body.campground)
    //grab the location data from the geoData function above and save it to the campground model
    campground.geometry = geoData.body.features[0].geometry
    //define variable for "author" / creator of campground and add it to instance
    campground.author = req.user._id;
    //uploading multiple photos requires another package, and then we can map the metadata to the campground
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    //save the new instance to the database, and AWAIT the completion of that save function
    await campground.save();
    console.log(campground);
    //flash a message to the user validating success (NOTE: requires connect-flash install)
    req.flash("success", "Successfully made a new campground")
    //redirect user to the SHOW page for the newly created instance
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.showCampground = async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate({ 
        path: "reviews",
        populate: {
            path: "author"
        } 
    }).populate("author")
    if(!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds"); 
    }
    res.render("campgrounds/show", { campground })
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id }= req.params;
    const campground = await Campground.findById(id)

    if(!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds"); 
    }

    //NOTE: on the "edit" page, use the "value" keyword on the input text to pre-populate the existing name and location
    res.render("campgrounds/edit", { campground })
};

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    //uploading multiple photos requires another package, and then we can map the metadata to the campground
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save()

    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}})
        console.log(campground)
    }

    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.renderDeleteForm = async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("campgrounds/delete", { campground });
};

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground successfully removed!");
    res.redirect("/campgrounds")
};