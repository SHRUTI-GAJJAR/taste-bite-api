
const express = require('express');
const multer = require('multer');
const path = require('path');
const Recipe = require('./../models/Recipes_m'); // Your Recipe model
const auth = require('./../middleware/authMiddleware');  // Authentication middleware
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'Recipe_pic/');  // Folder to save images (make sure this folder exists)
  },
  filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);  // Get the file extension
      cb(null, Date.now() + ext);  // Unique filename based on current timestamp
  }
});

const upload = multer({ storage: storage });

router.post('/' ,upload.single('thumbnailImage'), async (req, resp) => {
  try {
      const { name, ingredients, recipe, date, time, rating, user } = req.body;

      // Create the file path (relative to your public folder)
      const photoPath = req.file ? `Recipe_pic/${req.file.filename}` : null;

      // Create a new recipe item instance (no need for user authentication)
      const newRecipe = new Recipe({
          name, 
          ingredients,
          recipe,
          thumbnailImage: photoPath,
          date,
          time,
          rating,
          user: user || null // You can make 'user' optional if you want
      });

      // Save the new recipe to MongoDB
      await newRecipe.save();
      resp.status(201).json({ message: 'Recipe created successfully', recipe: newRecipe });
  } catch (err) {
      console.error(err);
      resp.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req, resp) => {
  try {
      // Fetch all recipes from the database
      const recipes = await Recipe.find();

      // Return the list of recipes with status 200
      resp.status(200).json({ message: 'Recipes retrieved successfully', recipes });
  } catch (err) {
      console.error(err);
      resp.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get Recipes by User ID
router.get('/user/:userId', async (req, resp) => {
  try {
    // Find recipes by user ID
    const recipes = await Recipe.find({ user: req.params.userId });

    // If no recipes found
    if (recipes.length === 0) {
      return resp.status(404).json({ message: 'No recipes found for this user' });
    }

    // Return the list of recipes
    resp.status(200).json({ message: 'Recipes retrieved successfully', recipes });
  } catch (err) {
    console.error(err);
    resp.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get Recipes by Name
router.get('/name/:name', async (req, resp) => {
  try {
    const nameQuery = req.params.name;
    
    // Use a regular expression to find recipes where the name contains the search term (case-insensitive)
    const recipes = await Recipe.find({
      name: { $regex: nameQuery, $options: 'i' }  // 'i' makes the search case-insensitive
    });

    // If no recipes found
    if (recipes.length === 0) {
      return resp.status(404).json({ message: 'No recipes found with this name' });
    }

    // Return the list of recipes
    resp.status(200).json({ message: 'Recipes retrieved successfully', recipes });
  } catch (err) {
    console.error(err);
    resp.status(500).json({ error: 'Internal Server Error' });
  }
});


// Update Recipe
router.put('/:id', upload.single('thumbnailImage'), async (req, resp) => {
    try {
      const { name, ingredients, recipe, date, time, rating, user } = req.body;
      
      // Check if a new file was uploaded and update the photo path
      let photoPath = req.file ? `Recipe_pic/${req.file.filename}` : null;
  
      // Find the recipe by ID and update it
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        {
          name,
          ingredients,
          recipe,
          thumbnailImage: photoPath || undefined,  // Only update photoPath if there's a new image
          date,
          time,
          rating,
          user: user || null, // Optional user field
        },
        { new: true } // Return the updated document
      );
  
      // If the recipe is not found
      if (!updatedRecipe) {
        return resp.status(404).json({ error: 'Recipe not found' });
      }
  
      // Return success response
      resp.status(200).json({ message: 'Recipe updated successfully', recipe: updatedRecipe });
    } catch (err) {
      console.error(err);
      resp.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Delete Recipe
  router.delete('/:id', async (req, resp) => {
    try {
      // Find the recipe by ID and delete it
      const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
  
      // If the recipe is not found
      if (!deletedRecipe) {
        return resp.status(404).json({ error: 'Recipe not found' });
      }
  
      // Return success response
      resp.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (err) {
      console.error(err);
      resp.status(500).json({ error: 'Internal Server Error' });
    }
  });


module.exports = router;