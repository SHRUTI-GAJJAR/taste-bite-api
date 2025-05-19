
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Items = require("../models/food-items");

// Set destination folder and filename logic for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads"; // Folder where files will be saved
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Create a new item route
router.post("/", upload.single("Thumbnail_img"), async (req, resp) => {
  try {
    const { name, price, Isvage, categories, rating,full_recipe } = req.body;

    // Create the file path (relative to your public folder)
    const photoPath = req.file ? `uploads/${req.file.filename}` : null;

    // Create a new item instance
    const newItem = new Items({
      name,
      price,
      Isvage,
      categories,
      Thumbnail_img: photoPath, // Store the file path in the database
      rating,
      full_recipe,
    });

    // Save the new item to MongoDB
    await newItem.save();
    resp
      .status(201)
      .json({ message: "Item created successfully", item: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Utility function to format Thumbnail_img consistently
function formatThumbnail(item) {
  if (item.Thumbnail_img && typeof item.Thumbnail_img === "string") {
    const fileName = item.Thumbnail_img.split("/").pop();
    item.Thumbnail_img = `uploads/${fileName}`;  // ONLY relative path, no domain/host
  }
  return item;
}

// Get all items
router.get("/", async (req, resp) => {
  try {
    const data = await Items.find().lean();
    const result = data.map(formatThumbnail);
    resp.status(200).json(result);
  } catch (err) {
    console.error(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
});

// Find item by name
router.get("/findByName/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const item = await Items.findOne({ name }).lean();

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    formatThumbnail(item);  // mutate item in place
    res.json(item);
  } catch (error) {
    console.error("Error fetching item by name:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Search API
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const items = await Items.find({
      name: { $regex: query, $options: "i" },
    }).lean();

    if (!items.length) {
      return res.status(404).json({ message: "No matching items found" });
    }

    const results = items.map(formatThumbnail);
    res.json(results);
  } catch (error) {
    console.error("Error searching items:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Find Veg product
router.get("/type/:isVeg", async (req, resp) => {
  try {
    const isVeg = req.params.isVeg.toLowerCase() === "true";
    const items = await Items.find({ Isvage: isVeg }).lean();

    const result = items.map(formatThumbnail);
    resp.status(200).json(result);
  } catch (err) {
    console.error(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
});

// Category list (no image formatting needed)
router.get("/categories", async (req, res) => {
  try {
    const categories = await Items.distinct("categories");
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get random items
router.get("/random-items", async (req, res) => {
  try {
    const allItems = await Items.find().lean();
    const shuffled = allItems.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 15);
    const result = selected.map(formatThumbnail);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get data category-wise
router.get("/category/:category", async (req, resp) => {
  try {
    const category = req.params.category;
    const data = await Items.find({ categories: category }).lean();

    const result = data.map(formatThumbnail);
    resp.status(200).json(result);
  } catch (err) {
    console.error(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
});


//Update Data:
router.put("/:id", async (req, resp) => {
  try {
    const personId = req.params.id;
    const updateData = req.body;

    const response = await Items.findByIdAndUpdate(personId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!response) {
      return resp.status(404).json({ error: "Items not found" });
    }
    console.log("data updated".blue);
    resp.status(200).json(response);
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "Internal Server error" });
  }
});

//Delete Data:
router.delete("/:id", async (req, resp) => {
  try {
    const personId = req.params.id;

    const response = await Items.findByIdAndDelete(personId);

    if (!response) {
      return resp.status(404).json({ error: "Items not found" });
    }
    console.log("Data Deleted".red);
    resp.status(200).json({ message: "Items Delete Successfully" });
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
