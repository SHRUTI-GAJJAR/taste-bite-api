const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  Isvage: { type: Boolean, required: true },
  categories: { type: String, required: true },
  Thumbnail_img: { type: String },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  cookingTime: { type: String }
});

const Items = mongoose.model("FoodItem", foodItemSchema);

module.exports = Items;
