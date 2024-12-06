const User = require('../models/User');

const profilePage = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('profile', { title: 'Profile', user });
  } catch (error) {
    res.status(500).send({ message: error.message || 'Error Occurred' });
  }
};

const updateUserInfo = async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findById(req.session.user.id);

    // Update name
    if (name) {
      user.name = name;
    }

    // Update password
    if (password) {
      const bcrypt = require('bcryptjs');
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    req.flash('success', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (error) {
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/profile');
  }
};

module.exports = { profilePage, updateUserInfo };
