const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'This field is required.',
  },
  description: {
    type: String,
    required: 'This field is required.',
  },
  ingredients: {
    type: Array,
    required: 'This field is required.',
  },
  category: {
    type: String,
    enum: ['Asian', 'Vegan', 'Thai', 'American', 'Chinese', 'Mexican', 'Indian', 'Seafood'],
    required: 'This field is required.',
  },
  image: {
    type: String,
    required: 'This field is required.',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true, // A recipe must belong to a user
  },
  likes: {
    type: [String], // Array of user IDs
    default: [],
  },
});

recipeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
