const User = require('../models/User');

const unfavoriteRecipe = async (req, res) => {
  try {
    // Get the user's ID from the session
    const user = await User.findById(req.session.user.id);

    // Remove the recipe from the favorites
    user.favorites = user.favorites.filter((recipeId) => recipeId.toString() !== req.params.id);

    // Save the updated user document
    await user.save();

    // Flash a success message and redirect
    req.flash('success', 'Recipe removed from favorites.');
    res.redirect('/profile');
  } catch (error) {
    // Handle any errors and flash an error message
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/profile');
  }
};

module.exports = { unfavoriteRecipe };
