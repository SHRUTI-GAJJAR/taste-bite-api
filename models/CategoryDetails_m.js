
const mongoose = require("mongoose");

const categoryDetailsSchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  totalRecipe: { type: Number, default: 0 }, 
});

const CategoryDetails = mongoose.model("CategoryDetails", categoryDetailsSchema);

module.exports = CategoryDetails;