/*** Importing modules ***/
import express from 'express';
import morgan from 'morgan'; // logging middleware
import cors from 'cors';
import session from 'express-session';

/** Authentication-related imports **/
import passport from 'passport'; // authentication middleware
import LocalStrategy from 'passport-local'; // authentication strategy (username and password)

import userDao from './dao-users.mjs'; // module for accessing the user table in the DB
import apiRoutes from './api.mjs';

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

/*** Passport ***/

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser.
 **/
passport.use(
  new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUser(username, password);
    if (!user) return callback(null, false, 'Incorrect username or password');

    return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser)
  }),
);

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) {
  // this user is id + username + name
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) {
  // this user is id + email + name
  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.authenticate('session'));

/*** API Routes ***/
app.use('/api', apiRoutes);

// Activating the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`Server listening at http://localhost:${PORT}`);
});
