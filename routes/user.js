const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../Utilities/catchAsync");
const User = require("../models/user");
const { storeReturnTo } = require('../middleware');

//controllers
//NOTE: routes are defined below, but the heavy lifting and larger code was moved to a "controllers" file
//This streamlines and simplifies the routes to be more user friendly and easily readable
const users = require("../controllers/users")

router.route("/register")
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route("/login")
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: "/login"}), users.login);

router.get("/logout", users.logout)

module.exports = router;