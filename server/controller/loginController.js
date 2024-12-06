const User = require('../models/User');
const bcrypt = require('bcryptjs');

const loginPage = async (req, res) => {
  try {
    res.render('login', { title: 'Login' });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Store user information in the session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.redirect('/');
  } catch (error) {
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/login');
  }
};

module.exports = { loginPage, handleLogin };
