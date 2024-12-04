require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');


exports.homepage = async(req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
    const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber);
    const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber);
    const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber);

    const food = { latest, thai, american, chinese };

    res.render('index', { title: 'Recipe Book - Welcome Home', categories, food } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
}

exports.exploreRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).render('not-found', { message: 'Recipe not found' });
    }

    res.render('recipe', {
      title: recipe.name,
      recipe,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || 'Error occurred' });
  }
};



exports.exploreCategories = async(req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categories } );
    res.render('categories', { title: 'Cooking Blog - Categories', categories } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 



exports.exploreCategoriesById = async(req, res) => { 
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', { title: 'Recipe Book - Categoreis', categoryById } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 
 

exports.exploreRecipe = async(req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('recipe', { title: 'Re - Recipe', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 


exports.searchRecipe = async(req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
    res.render('search', { title: 'Recipe Book - Search', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
  
}


exports.exploreLatest = async(req, res) => {
  try {
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', { title: 'Recipe Book - Explore Latest', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 


exports.exploreRandom = async (req, res) => {
  try {
    const count = await Recipe.countDocuments();
    const random = Math.floor(Math.random() * count);
    const recipe = await Recipe.findOne().skip(random);

    if (!recipe) {
      return res.status(404).render('not-found'); // Handle no recipe found
    }

    res.render('explore-random', { recipe });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};




exports.submitRecipe = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', { title: 'Recipe Book - Submit Recipe', infoErrorsObj, infoSubmitObj  } );
}


exports.submitRecipeOnPost = async(req, res) => {
  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      console.log('No Files where uploaded.');
    } else {

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.satus(500).send(err);
      })

    }

    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName
    });
    
    await newRecipe.save();

    req.flash('infoSubmit', 'Recipe has been added.')
    res.redirect('/submit-recipe');
  } catch (error) {
    // res.json(error);
    req.flash('infoErrors', error);
    res.redirect('/submit-recipe');
  }
}



async function deleteRecipe() {
  try {
    await Recipe.deleteOne({ name: 'New Recipe From Form' });
  } catch (error) {
    console.log(error);
  }
}
deleteRecipe();



async function updateRecipe() {
  try {
    const res = await Recipe.updateOne({ name: 'New Recipe' }, { name: 'New Recipe Updated' });
    console.log('Documents matched:', res.n);
    console.log('Documents modified:', res.nModified);
  } catch (error) {
    console.log(error);
  }
}
updateRecipe();



// Dummy Data Example

async function insertDummyCategoryData() {
  try {
    await Category.insertMany([
      {
        "name": "Thai",
        "image": "thai-food.jpg"
      },
      {
        "name": "American",
        "image": "american-food.jpg"
      },
      {
        "name": "Chinese",
        "image": "chinese-food.jpg"
      },
      {
        "name": "Mexican",
        "image": "mexican-food.jpg"
      },
      {
        "name": "Indian",
        "image": "indian-food.jpg"
      },
      {
        "name": "Spanish",
        "image": "spanish-food.jpg"
      }
    ]);
  } catch (error) {
    console.log('err', + error);
  }
}


async function insertDummyRecipeData() {
  try {
    await Recipe.insertMany([
      {
        name: "Chinese Steak Tofu Stew",
        description: `A flavorful stew made with tender steak, tofu, and Chinese spices.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "200g steak slices",
          "150g tofu cubes",
          "2 tbsp soy sauce",
          "1 tbsp sesame oil"
        ],
        category: "Chinese",
        image: "chinese-steak-tofu-stew.jpg"
      },
      {
        name: "Chocolate Banoffee Whoopie Pies",
        description: `A delightful mix of chocolate and banana in soft, fluffy pies.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "2 bananas",
          "100g dark chocolate",
          "200g whipped cream",
          "200g sugar"
        ],
        category: "Dessert",
        image: "chocolate-banoffe-whoopie-pies.jpg"
      },
      {
        name: "Crab Cakes",
        description: `Golden, crispy crab cakes perfect as appetizers or a main course.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "200g crab meat",
          "50g breadcrumbs",
          "1 egg",
          "1 tsp Dijon mustard"
        ],
        category: "Seafood",
        image: "crab-cakes.jpg"
      },
      {
        name: "Grilled Lobster Rolls",
        description: `A classic seafood dish with butter-grilled lobster in a soft roll.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "200g lobster meat",
          "4 hot dog rolls",
          "2 tbsp butter",
          "1 tbsp mayonnaise"
        ],
        category: "Seafood",
        image: "grilled-lobster-rolls.jpg"
      },
      {
        name: "Key Lime Pie",
        description: `A tangy and sweet pie with fresh lime and a graham cracker crust.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "3 limes (juiced)",
          "200g graham crackers",
          "1 can condensed milk",
          "100ml whipping cream"
        ],
        category: "Dessert",
        image: "key-lime-pie.jpg"
      },
      {
        name: "Southern Fried Chicken",
        description: `Crispy, juicy fried chicken seasoned with a Southern-style blend.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "1 kg chicken pieces",
          "2 cups flour",
          "1 tsp cayenne pepper",
          "1 tsp paprika"
        ],
        category: "American",
        image: "southern-friend-chicken.jpg"
      },
      {
        name: "Spring Rolls",
        description: `Crispy rolls filled with fresh vegetables and served with dipping sauce.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "100g carrots (julienned)",
          "100g cabbage (shredded)",
          "Spring roll wrappers",
          "Sweet chili sauce"
        ],
        category: "Asian",
        image: "spring-rolls.jpg"
      },
      {
        name: "Stir-Fried Vegetables",
        description: `A healthy mix of stir-fried seasonal vegetables with soy sauce.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "200g mixed vegetables",
          "2 tbsp soy sauce",
          "1 tbsp sesame oil",
          "1 tsp garlic (minced)"
        ],
        category: "Vegan",
        image: "stir-fried-vegetables.jpg"
      },
      {
        name: "Thai Chinese Inspired Salad",
        description: `A fresh and tangy salad with a hint of Thai flavors.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "100g lettuce",
          "50g cherry tomatoes",
          "1 tbsp fish sauce",
          "1 tbsp lime juice"
        ],
        category: "Salad",
        image: "thai-chinese-inspired-pinch-salad.jpg"
      },
      {
        name: "Thai Green Curry",
        description: `A classic Thai dish made with green curry paste and coconut milk.`,
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "200g chicken",
          "100ml coconut milk",
          "2 tbsp green curry paste",
          "1 tbsp fish sauce"
        ],
        category: "Thai",
        image: "thai-green-curry.jpg"
      },
      {
        name: "Steak with Red Wine Sauce",
        description: "A juicy steak served with a flavorful red wine reduction.",
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "1 steak",
          "1 cup red wine",
          "Salt and pepper to taste",
          "1 tbsp butter",
        ],
        category: "American",
        image: "chinese-steak-tofu-stew.jpg",
      },
      {
        name: "Key Lime Pie",
        description: "A tangy and creamy key lime pie with a graham cracker crust.",
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "1 graham cracker crust",
          "3/4 cup key lime juice",
          "1 can sweetened condensed milk",
          "Whipped cream for topping",
        ],
        category: "American",
        image: "key-lime-pie.jpg",
      },
      {
        name: "Crab Cakes",
        description: "Delicious crab cakes served with a tangy remoulade sauce.",
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "1 lb crab meat",
          "1/2 cup breadcrumbs",
          "1 egg",
          "1/4 cup mayo",
        ],
        category: "American",
        image: "crab-cakes.jpg",
      },
      {
        name: "Thai Green Curry",
        description: "A spicy and aromatic green curry with vegetables and chicken.",
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "2 tbsp green curry paste",
          "1 can coconut milk",
          "1 cup chicken breast",
          "Mixed vegetables",
        ],
        category: "Thai",
        image: "thai-green-curry.jpg",
      },
      {
        name: "Tom Daley Soup",
        description: "A warming Thai-inspired vegetable broth.",
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "1 cup vegetable stock",
          "Mixed Thai herbs",
          "Chili for spice",
        ],
        category: "Thai",
        image: "thai-inspired-vegetable-broth.jpg",
      },
      {
        name: "General Tso's Chicken",
        description: "Crispy chicken in a tangy General Tso's sauce.",
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "1 lb chicken",
          "1/2 cup soy sauce",
          "1/4 cup sugar",
          "Cornstarch for frying",
        ],
        category: "Chinese",
        image: "general-tso-chicken.jpeg",
      },
      {
        name: "Thai-Style Mussels",
        description: "Fresh mussels cooked in a Thai-inspired coconut broth.",
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "1 lb mussels",
          "1 can coconut milk",
          "Thai basil",
          "Lemongrass",
        ],
        category: "Thai",
        image: "thai-style-mussels.jpg",
      },
      {
        name: "Veggie Pad Thai",
        description: "A classic Thai dish with stir-fried noodles and fresh vegetables.",
        email: "recipeemail@raddy.co.uk",
        ingredients: [
          "1 lb rice noodles",
          "1/2 cup peanut sauce",
          "Mixed vegetables",
          "2 eggs",
        ],
        category: "Thai",
        image: "veggie-pad-thai.jpg",
      },
    ]);
  console.log("Dummy recipes added successfully!");
  } catch (error) {
    console.log("Error inserting dummy recipes:", error);
  }
}
insertDummyRecipeData();

