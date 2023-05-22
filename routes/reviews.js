const express = require("express");
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const catchAsync = require("../Utilities/catchAsync")
const ExpressError = require("../Utilities/ExpressError")

const Campground = require("../models/campground");
const Review = require("../models/review");

//controllers
//NOTE: routes are defined below, but the heavy lifting and larger code was moved to a "controllers" file
//This streamlines and simplifies the routes to be more user friendly and easily readable
const reviews = require("../controllers/reviews")



router.post("/", isLoggedIn, validateReview, catchAsync( reviews.createReview ))

//delete reviews
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync( reviews.deleteReview))

module.exports = router;