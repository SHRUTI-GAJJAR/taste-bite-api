
const express = require("express");
const router = express.Router();

const FoodItem = require("./../models/food-items");
const CategoryDetails = require("./../models/CategoryDetails_m");

router.post("/", async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const existing = await CategoryDetails.findOne({ categoryName });
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const newCategory = new CategoryDetails({
      categoryName,
      count: 0
    });

    const saved = await newCategory.save();
    res.status(201).json({ message: "Category created", data: saved });
  } catch (error) {
    res.status(500).json({ error: "Failed to create category", details: error.message });
  }
});

router.get("/generate-categories", async (req, res) => {
  try {
    // Get all items
    const items = await FoodItem.find();

    // Count by category
    const categoryMap = {};
    items.forEach(item => {
      const cat = item.categories;
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    // Save to CategoryDetails collection
    const updates = Object.entries(categoryMap).map(async ([categoryName, count]) => {
      await CategoryDetails.findOneAndUpdate(
        { categoryName },
        { count },
        { upsert: true, new: true }
      );
    });

    await Promise.all(updates);

    res.status(200).json({ message: "Category counts updated", data: categoryMap });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate category data", details: error.message });
  }
});

module.exports = router;