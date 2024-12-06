const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;


require('dotenv').config();

app.use(express.urlencoded( { extended: true } ));
app.use(express.static('public'));
app.use(expressLayouts);
app.use(cookieParser('CookingBlogSecure'));
app.use(session({
  secret: 'CookingBlogSecretSession',
  saveUninitialized: false,
  resave: false
}));

app.use(flash());

app.set('layout', './layouts/mainLayout');
app.set('view engine', 'ejs');

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB\n'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null; // Pass user session to views
  next();
});

app.use(
  session({
    secret: 'CookingBlogSecretSession',
    saveUninitialized: false,
    resave: false,
    cookie: {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Ensures cookies are only sent over HTTPS in production
      maxAge: 1000 * 60 * 60 * 24, // 1-day expiration
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public')); // Serve uploaded files

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out. Please try again.');
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.redirect('/');
  });
});

const routes = require('./server/routes/routes.js')
app.use('/', routes);

app.listen(port, ()=> console.log(`Listening to port ${port}`));