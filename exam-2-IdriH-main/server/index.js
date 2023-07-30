'use strict';

const PORT = 3000;

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(morgan('combined'));
app.use(express.json());

const { check, validationResult, } = require('express-validator'); // validation middleware


const seatsDao = require('./dao-seats');
const userDao = require('./dao-users');

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
  };
  app.use(cors(corsOptions));

/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(email, password, callback) {
  const user = await userDao.getUser(email, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "this is idris secret , secret of idri ,nobody should know except ... idri",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}


/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  console.log("Welcome to login post of index.js")
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});





app.get('/api/seats/:plane_id',async (req, res) => {

    try{
        const result = await seatsDao.getSeats(req.params.plane_id);
        if(result.error){
            res.status(404).json(result);
        }
        else{
            res.json(result);
        }
    }catch(err){
        res.status(500).json({error: err});
    }
    
}) ;

app.put('/api/seats/:plane_id',isLoggedIn,async (req, res) => {
    console.log("Welcome to index.js")
    const seats_chosen = req.body.seats;
    const plane_id = req.params.plane_id;
    
    const seatsAlreadyBooked = await seatsDao.checkIfAlreadyBooked(plane_id,req.user.id);
    if(seatsAlreadyBooked.error){
        return res.status(409).json({error: seatsAlreadyBooked.error});
    }
    
    const occupiedChosenSeats = await seatsDao.checkOccupation(seats_chosen,plane_id);
    if(occupiedChosenSeats.length > 0){ 
        return res.status(409).json({error: 'Seats already booked', seatsAlreadyBooked: occupiedChosenSeats});
    }
    
    try{
        const result = await seatsDao.updateSeats(seats_chosen,plane_id,req.user.id);
        if(result.error){
            res.status(404).json(result);
        }
        else{
            res.json(result);
        }
    }catch(err){    
        res.status(500).json({error: err});
    }
})

//Get booking for a specific user
app.get('/api/seats/user/:plane_id',isLoggedIn ,async (req, res) => {
   console.log("Welcome to getBooking of index.js")
    const user_id = req.user.id;
    const plane_id = req.params.plane_id;
    try{
        const result = await seatsDao.getBooking(user_id,plane_id);
        if(result.error){
            res.status(404).json(result);
        }
        else{
            res.json(result);
        }
    }catch(err){    
        res.status(500).json({error: err});
    }  
})

app.put('/api/seats/user/delete/:plane_id',isLoggedIn, async (req, res) => {
    const user_id = req.user.id;
    const plane_id = req.params.plane_id;
    console.log("Welcome to deleteBooking of index.js")
    try{
        const result = await seatsDao.deleteBooking(user_id,plane_id);
        if(result.error){
            res.status(404).json(result);
        }
        else{
            res.json(result);
        }
    }catch(err){
        res.status(500).json({error: err});
    }
})

app.put('/api/random',isLoggedIn , async (req, res) => {
    console.log(req.body);

    const plane_id = req.body.plane_id;
    const user_id = req.user.id;
    const number_of_seats = req.body.number;
    console.log(number_of_seats)
    console.log("Welcome to random of index.js")
    try{
        const result = await seatsDao.randomBooking(plane_id,user_id,number_of_seats);
        if(result.error){
            res.status(400).json(result.error);
        }
        else{
            res.json(result);

        }
    }catch(err){
        res.status(500).json({error: err});
    }
})

app.get('/api/seats/available/:plane_id', async (req, res) => {
    const plane_id = req.params.plane_id;
    console.log("Welcome to available of index.js")
    try{
        const result = await seatsDao.getAvailableSeats(plane_id);
        if(result.error){
            res.status(404).json(result);
        }
        else{
            res.json(result);
        }
    }catch(err){
        res.status(500).json({error: err});
    }
})

app.listen(PORT,
    () => { console.log(`Server started on http://localhost:${PORT}/`) });