const Recipe = require('../models/Recipe');
const path = require('path');
const fs = require('fs');

const viewListRecipePage = async (req, res) => {
  try {
    if (!res.locals.user) {
      req.flash('error', 'You must be logged in to view your recipes.');
      return res.redirect('/login');
    }

    // Fetch recipes based on the logged-in user's email
    const recipes = await Recipe.find({ user: res.locals.user.id });

    res.render('recipe', { title: 'Recipes', recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).send({ message: error.message || 'Error Occurred' });
  }
};

const viewEditRecipePage = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      req.flash('error', 'Recipe not found.');
      return res.redirect('/recipe');
    }

    res.render('edit-recipe', { title: 'Edit Recipe', recipe });
  } catch (error) {
    console.error('Error fetching recipe for editing:', error);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/recipe');
  }
};

const viewFavoriteRecipePage = async (req, res) => {
  try {
    // Fetch recipes liked by the logged-in user
    const likedRecipes = await Recipe.find({ likes: req.session.user.id });

    res.render('liked-recipes', {
      title: 'Liked Recipes',
      recipes: likedRecipes,
      user: res.locals.user,
    });
  } catch (error) {
    console.error('Error fetching liked recipes:', error);
    req.flash('error', 'Unable to load liked recipes.');
    res.redirect('/');
  }
};

const viewAllRecipePage = async (req, res) => {
  try {
    const recipes = await Recipe.find({}); // Fetch all recipes from the database
    const user = res.locals.user || null; // Check if user is logged in
    const categories = await Recipe.distinct('category');

    const recipesByCategory = {};
    categories.forEach((category) => {
      recipesByCategory[category] = recipes.filter((recipe) => recipe.category === category);
    });

    res.render('all-recipes', { title: 'All Recipes', categories, recipesByCategory, user });
  } catch (error) {
    console.error('Error fetching all recipes:', error);
    req.flash('error', 'Unable to load recipes.');
    res.redirect('/');
  }
};

const createRecipe = async (req, res) => {
  try {
    const { name, description, ingredients, category } = req.body;

    if (!req.file) {
      req.flash('error', 'Image is required.');
      return res.redirect('/recipe');
    }

    // Ensure the user is logged in
    if (!res.locals.user) {
      req.flash('error', 'You must be logged in to create a recipe.');
      return res.redirect('/login');
    }

    // Retrieve file information from Multer
    const image = req.file;

    // Construct the path for saving the file
    const uploadPath = path.join(__dirname, '../../public/uploads', image.filename);

    // Rename the file (if needed) or move it to a different location
    const finalPath = path.join(__dirname, '../../public/uploads', `${Date.now()}-${image.originalname}`);
    fs.renameSync(uploadPath, finalPath);

    // Save recipe information to the database
    const recipe = new Recipe({
      name,
      description,
      ingredients: ingredients.split(','),
      category,
      image: `/uploads/${path.basename(finalPath)}`, // Path to serve the image
      user: res.locals.user.id, // Associate the recipe with the logged-in user
    });

    await recipe.save();
    req.flash('success', 'Recipe created successfully.');
    res.redirect('/recipe');
  } catch (error) {
    console.error('Error creating recipe:', error);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/recipe');
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    // Delete associated image
    if (recipe.image) {
      const imagePath = `public${recipe.image}`;
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Recipe.findByIdAndDelete(req.params.id);
    req.flash('success', 'Recipe deleted successfully.');
    res.redirect('/recipe');
  } catch (error) {
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/recipe');
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { name, description, ingredients, category } = req.body;

    // Fetch the recipe to update
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      req.flash('error', 'Recipe not found.');
      return res.redirect('/recipe');
    }

    // Update the fields
    recipe.name = name || recipe.name;
    recipe.description = description || recipe.description;
    recipe.ingredients = ingredients ? ingredients.split(',') : recipe.ingredients;
    recipe.category = category || recipe.category;

    // Update the image if provided
    if (req.file) {
      const image = req.file;
      const uploadPath = path.join(__dirname, '../../public/uploads', image.filename);
      const finalPath = path.join(__dirname, '../../public/uploads', `${Date.now()}-${image.originalname}`);
      fs.renameSync(uploadPath, finalPath);

      // Delete old image
      if (recipe.image) {
        const oldImagePath = `public${recipe.image}`;
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      recipe.image = `/uploads/${path.basename(finalPath)}`;
    }

    await recipe.save();
    req.flash('success', 'Recipe updated successfully.');
    res.redirect('/recipe');
  } catch (error) {
    console.error('Error updating recipe:', error);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/recipe');
  }
};

const likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      req.flash('error', 'Recipe not found.');
      return res.redirect('/recipes');
    }

    // Toggle like/unlike
    if (!recipe.likes.includes(req.session.user.id)) {
      recipe.likes.push(req.session.user.id);
    } else {
      recipe.likes = recipe.likes.filter((id) => id !== req.session.user.id);
    }

    await recipe.save();

    // Redirect to the recipes page with the active tab
    const redirectTab = req.query.tab ? `?tab=${req.query.tab}` : '';
    res.redirect(`/recipes${redirectTab}`);
  } catch (error) {
    console.error('Error liking/unliking recipe:', error);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/recipes');
  }
};


module.exports = { 
  viewListRecipePage, viewEditRecipePage, viewFavoriteRecipePage,
  viewAllRecipePage, likeRecipe, createRecipe, deleteRecipe, updateRecipe,
};
