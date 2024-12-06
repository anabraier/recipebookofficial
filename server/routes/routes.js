const express = require('express');
const router = express.Router();

// Page Controllers
const indexController = require('../controller/indexController');
const aboutController = require('../controller/aboutController');
const contactController = require('../controller/contactController');

// User Auth Controllers
const loginController = require('../controller/loginController');
const signupController = require('../controller/signUpController');

const profileController = require('../controller/profileController');
const likeController = require('../controller/likeController');
const recipeController = require('../controller/recipeController');


const isAuthenticated = require('../middleware/isAuthenticated'); // Middleware to protect routes

const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' }); // Files will be saved to the "uploads" folder


/**
 * App Routes 
*/
router.get('/', indexController);
router.get('/contact', contactController);
router.get('/about', aboutController);

// User Auth Routes
router.get('/login', loginController.loginPage);
router.post('/login', loginController.handleLogin);
router.get('/signup', signupController.signUpPage);
router.post('/signup', signupController.handleSignUp);

// User Managment Routes
router.get('/profile', isAuthenticated, profileController.profilePage);
router.post('/profile', isAuthenticated, profileController.updateUserInfo);
router.post('/recipe/unfavorite/:id', isAuthenticated, likeController.unfavoriteRecipe);


// Recipe Routes
router.get('/recipe', isAuthenticated, recipeController.viewListRecipePage); // Render the list recipe page
router.get('/recipe/edit/:id', isAuthenticated, recipeController.viewEditRecipePage); // Render the edit recipe page
router.get('/recipes/liked', isAuthenticated, recipeController.viewFavoriteRecipePage); // Render the favorite recipe page

router.post('/recipe/create', isAuthenticated, upload.single('file'), recipeController.createRecipe);
router.post('/recipe/delete/:id', isAuthenticated, recipeController.deleteRecipe);
router.post('/recipe/edit/:id', isAuthenticated, upload.single('file'), recipeController.updateRecipe);  // Handle the update recipe request
router.get('/recipes', recipeController.viewAllRecipePage);
router.post('/recipes/like/:id', isAuthenticated, recipeController.likeRecipe); // Handle liking recipe

module.exports = router;