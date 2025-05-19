const mongoose = require("mongoose");
const CategoryDetails = require("./../models/CategoryDetails_m");

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  Isvage: { type: Boolean, required: true },
  categories: { type: String, required: true },
  Thumbnail_img: { type: String },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  cookingTime: { type: String },
});

// Increment after save
foodItemSchema.post("save", async function (doc) {
  const categoryName = doc.categories?.trim();
  if (!categoryName) return;

  await CategoryDetails.findOneAndUpdate(
    { categoryName },
    { $inc: { totalRecipe: 1 } }, // ✅ Correct field
    { upsert: true, new: true }
  );
});

// Decrement after delete
foodItemSchema.post("findOneAndDelete", async function (doc) {
  const categoryName = doc.categories?.trim();
  if (!categoryName) return;

  await CategoryDetails.findOneAndUpdate(
    { categoryName },
    { $inc: { totalRecipe: -1 } }
  );
});

const Items = mongoose.model("FoodItem", foodItemSchema);
module.exports = Items;
