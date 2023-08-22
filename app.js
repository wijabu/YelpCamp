if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
//require absolute paths to directories
const path = require("path", __dirname);
//connect express to mongoDB
const mongoose = require("mongoose");
//designate ejs-mate as an "engine", so you can use JS to dynamically create HTML
const engine = require("ejs-mate");
//create sessions for users to enable statefulness (and keep temp memory for things like shopping carts)
const session = require('express-session');
//temporarily flash messages to the end user 
const flash = require("connect-flash");
//error handling 
const ExpressError = require("./Utilities/ExpressError")
//override POST method for web forms to do things like DELETE and PUT
const methodOverride = require("method-override");
//passport is an authentication tool; helps build users & passwords
const passport = require("passport");
const LocalStrategy = require("passport-local");
//passport requires the User model 
const User = require("./models/user")
//helmet is a popular security package with a variety of options
const helmet = require('helmet')

/////////ROUTE REQUIREMENTS
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")
const userRoutes = require("./routes/user");
//MongoDB session store for Connect and Express written in Typescript.
const MongoStore = require("connect-mongo");

//CONNECT TO DB 
// const dbUrl = "mongodb://localhost:27017/yelpCamp"
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelpCamp"
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("The mongoose has landed!");
})


//DEFINE path to "views" folder, which is an expected directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


///////////////CONFIGURATIONS

//this code sets the "engine" that parses and make sense of EJS to define layout templates
app.engine("ejs", engine);
//this code is required to parse the req.body. req.body is used when creating new items via web form
app.use(express.urlencoded({ extended: true }));
//this code is required to define the query string to utilize methods other than POST for web forms
app.use(methodOverride("_method"));
//this code tells express to serve our public directory for STATIC files
app.use(express.static(path.join(__dirname, "public")));


//////////////////////CONFIGURE SESSION
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    touchAfter: 24 * 3600 // time period in seconds
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'fresh',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 50 * 24 * 7,
        maxAge: 1000 * 60 * 50 * 24 * 7
    }
}
app.use(session(sessionConfig))

////////////////PASSPORT MIDDLEWARE

app.use(passport.initialize());
//NOTE: app.use(session()) must be defined BEFORE passport.session()
app.use(passport.session());
//NOTE: the following is the authentication method build into passport's Local Strategy
passport.use(new LocalStrategy(User.authenticate()))
//Serialization allows storage of a user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//TEMP ROUTE TO TEST PASSPORT
app.get("/testAuth", async (req, res) => {
    const user = new User({ email: "testUser@gmail.com", username: "testUser1" });
    const newUser = await User.register(user, "testPass1");
    res.send(newUser);
})

////////////////FLASH

app.use(flash());

//FLASH MIDDLEWARE
//NOTE: this code goes BEFORE the route handlers, and it takes whatever's in the FLASH under SUCCESS and have access to it in our locals
app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

////////////////HELMET (security package)

app.use(helmet({ contentSecurityPolicy: false }));

//////////ROUTES

app.get("/", (req, res) => {
    res.render("home");
})

//NOTE: Routes were originally written in this file, but have been moved to individual routes.js files in another directory ("routes")
//Here is the code defining the path to the relocated routes
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", userRoutes);


////////////////////////ERROR HANDLING

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, something went wrong, my guy!"
    res.status(statusCode).render("error", { err });
})


////////////////////////EVENT LISTENER

const port = process.env.PORT || "3000"

app.listen(port, () => {
    console.log(`Serving on Port: ${ port }`);
})