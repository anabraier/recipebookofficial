const User = require('../models/User');
const bcrypt = require('bcryptjs');

const signUpPage = async (req, res) => {
  try {
    res.render('signup', { title: 'Signup' });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
};

const handleSignUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email already exists');
      return res.redirect('/signup');
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user and save it to the database
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    req.flash('success', 'Signup successful! Please log in.');
    res.redirect('/login');
  } catch (error) {
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/signup');
  }
};

module.exports = { signUpPage, handleSignUp };
