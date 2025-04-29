
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./db');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const bodyParser = require('body-parser');

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'https://your-project-name.vercel.app',
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
// Middleware for parsing incoming JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Establish DB connection
connectDB();  // Connect to MongoDB


// For Items:
const itemsRouter = require('./routers/food_route'); // Importing the items router
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/items', itemsRouter);

//For category:
const CategoryRouter = require('./routers/categories_route')
app.use('/Category', express.static(path.join(__dirname, 'Category')));
app.use('/categories', CategoryRouter);

//For Recipes:
const recipeRouter = require('./routers/Recipes_route')
app.use('/Recipe_pic', express.static(path.join(__dirname, 'Recipe_pic')));
app.use('/recipe', recipeRouter);

//user:
app.use('/profile', express.static(path.join(__dirname, 'profile')));
const authRoutes = require('./routers/auth');
app.use('/auth', authRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`.green);
});
