/*==================== REQUIRE DEPENDENCIES ====================*/
var express          = require('express'),
    session          = require('express-session'),
    bodyParser       = require('body-parser'),
    passport         = require('passport'),
    // LinkedInStrategy = require('passport-linkedin').Strategy,
    User             = require('./models/user.js'),
    Controller       = require('./controllers/listingController.js')
    http             = require('http');

/*===================== INITIALIZE EXPRESS =====================*/
var app = express();

//Allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/*================= CONFIGURE PASSPORT/LINKEDIN ================*/
app.use(session({ secret: "DECEITFUL PANDA IS THE WEB FOR YOUR JOB COB"}));
// app.use(passport.initialize());
// app.use(passport.session());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete LinkedIn profile is
//   serialized and deserialized.
// passport.serializeUser(function(user, done) {
//   done(null, user);
// });

// passport.deserializeUser(function(obj, done) {
//   done(null, obj);
// });


// passport.use(new LinkedInStrategy({
//   consumerKey: process.env.LINKEDIN_API_KEY || 'DUMMY',
//   consumerSecret: process.env.LINKEDIN_SECRET_KEY || 'DUMMY',
//   callbackURL: process.env.AUTH_CALLBACK_URL || 'DUMMY'
//   },
//   function(token, tokenSecret, profile, done) {
//     User.findOrCreate({ linkedinId: profile.id}, function(err, user) {
//       return done(err, user);
//     });
//   }
//   ));

/*===================== INITIALIZE ROUTERS =====================*/
// Not currently in use for CORS and session compatibility
// var userRouter = express.Router();
// var listingRouter = express.Router();

/*================== CONFIGURE EXPRESS MODULES =================*/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

console.log(__dirname);

/*===================== SET EXPRESS ROUTES =====================*/
// app.use('/api/users', userRouter);

app.post('/api/users/signup', function(req, res, next){
  console.log('req.body.username: ', req.body.username);
  //create new user session and database entry if username does not already exist
  new User({user_name: req.body.username}).fetch()
    .then(function(foundUser){
      console.log('foundUser: ', foundUser);
      if (!foundUser){
        console.log('req.body.password: ', req.body.password);
        new User({user_name: req.body.username, password: req.body.password}).save().then(function(newUser){
          // regenerate session with new user
          req.session.regenerate(function() {
            req.session.user = newUser;
            res.redirect('/');
          });
        });
      } else {
        console.error('User already exists!');
      }
    });
});

app.post('/api/users/login', function(req, res, next){
  console.log('REQ.BODY: ', req.body);
  //check username and password to log in
  var username = req.body.username;
  var password = req.body.password;
  new User({user_name: username}).fetch().then(function(user){
    // if user does not exist, redirect to /
    if( !user ){
      res.redirect('/');
    } else {
      // comparePassword() calls bcrypt.compare() on the provided password
      // and passes the result (true or false) to the provided callback
      user.comparePassword(password, function(match){
        // if password is correct, regenerate session with logged-in user
        if(match) {
          req.session.regenerate(function() {
            req.session.user = newUser;
            res.redirect('/');
          });
        // else redirect to /
        } else {
          res.redirect('/')
        }
      });
    };
  });
});

app.get('/api/users/logout', function(req, res, next){
  //delete session on logout
  req.session.destroy(function(){
    res.redirect('/');
  });
});

// app.use('/api/listings', listingRouter);

app.get('/api/users/checkbookmarklet', function(req, res, next){
  //check user session to let bookmarklet know if logged in or not
  var response = {};
  response.isAuthenticated = false;

  // if req.session exists, set loggedIn to req.session.user cast as a boolean
  // else set loggedIn to false
  var loggedIn = req.session ? !!req.session.user : false;

  // if user is not logged in, send back false
  if (!loggedIn){
    res.send(response);
  // else check if user exists
  } else {
    new User({user_name: loggedIn.username}).fetch().then(function(user){
      // if user does not exist, send back false
      if (!user){
        res.send(response);
      // else user does exist and is logged in -- send back true
      } else {
        response.isAuthenticated = true;
        res.send(response);
      }
    });
  }
});

//listing routes
// grab all listings when a GET request is sent to /api/listings
app.get('/api/listings', Controller.getListing);
// save listing when a POST request is sent to /api/listings
app.post('/api/listings', Controller.saveListing);

/*=================== SET ROUTER DEPENDENCIES ==================*/
// Not currently in use for CORS and session compatibility
// require('./routes/userRoutes.js')(userRouter);
// require('./routes/listingRoutes.js')(listingRouter);

/*================== EXPORT EXPRESS TO MODULE ==================*/
module.exports = app;