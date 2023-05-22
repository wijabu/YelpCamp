const express = require("express");
const router = express.Router();
const multer  = require('multer')
const { storage } = require("../cloudinary")
const upload = multer({ storage })

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware.js");
const catchAsync = require("../Utilities/catchAsync");
const Campground = require("../models/campground");

//controllers
//NOTE: routes are defined below, but the heavy lifting and larger code was moved to a "controllers" file
//This streamlines and simplifies the routes to be more user friendly and easily readable
const campgrounds = require("../controllers/campgrounds")

////////////VALIDATION MIDDLEWARE

//Middleware functions were here, but moved to middleware.js

//////////ROUTES

//NOTE: "catchAsync" is a wrapper for error handling. the JS file is in the Utilities folder
//NOTE2: you can chain routes together if they go to the same root but with different verbs (e.g. get, post, etc). Just use "router.route"

router.route("/")
    .get(catchAsync(campgrounds.index))
    //post request to add new campground database
    .post(isLoggedIn, upload.array("campground[image]"), validateCampground, catchAsync(campgrounds.createCampground));
    // .post(upload.array("campground[image]"), (req, res) => {
    //     // res.send(req.body, req.file)
    //     res.status(200).send(req.files)
    //     console.log(req.body, req.files)
    // })

//CREATE NEW CAMPGROUND FORM
//NOTE: if you add this code AFTER the findById(), it will crash because the database can't find any campground with the ID of "new"
router.get("/new", isLoggedIn, campgrounds.renderNewForm)


router.route("/:id")
    //Find existing campgrounds and SHOW page
    .get(catchAsync(campgrounds.showCampground))
    //post edit request (PUT) to database
    //NOTE: you must "require" the "method-override" package to enable PUT, PATCH, etc
    .put(isLoggedIn, isAuthor, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.updateCampground))
    //Delete from db
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//edit form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

//delete confirmation page
router.get("/:id/delete", isLoggedIn, catchAsync(campgrounds.renderDeleteForm));

module.exports = router;