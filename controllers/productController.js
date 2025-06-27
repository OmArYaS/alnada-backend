import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getProducts(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      category,
      name,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {};

    if (category) filter.category = new mongoose.Types.ObjectId(category);

    if (name) filter.name = new RegExp(name, "i");

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("category");

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      data: products,
      page: parseInt(page),
      totalPages: Math.ceil(limit == 0 ? 1 : total / limit),
      totalItems: total,
      length: products.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function getProductById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const data = await Product.findById(id);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function createProduct(req, res) {
  const { name, stock, address, size, price, description, category } =
    req.body;

  // Ensure images are uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "At least one image is required" });
  }

  if (!name || !price || !description || !category || !address || !stock) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const imageUrls = req.files.map((file) => `/images/${file.filename}`);

    const newProduct = new Product({
      name,
      images: imageUrls,
      address,
      stock,
      size,
      price,
      description,
      category,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const cleanBody = {};
  Object.entries(req.body).forEach(([key, value]) => {
    if (
      value !== "" &&
      value !== "null" &&
      value !== undefined &&
      value !== "0"
    ) {
      cleanBody[key] = value;
    }
  });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    // If new images are uploaded, handle image replacement
    if (req.files && req.files.length > 0) {
      // Get the existing product to delete old images
      const existingProduct = await Product.findById(id);
      if (
        existingProduct &&
        existingProduct.images &&
        Array.isArray(existingProduct.images)
      ) {
        // Delete old images from server
        for (const imgPath of existingProduct.images) {
          try {
            const imagePath = path.join(__dirname, "..", "public", imgPath);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          } catch (error) {
            console.error("Error deleting old image:", error);
            // Continue even if image deletion fails
          }
        }
      }

      // Add new image URLs to cleanBody
      const imageUrls = req.files.map((file) => `/images/${file.filename}`);
      cleanBody.images = imageUrls;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, cleanBody, {
      new: true,
    });
    if (updatedProduct) {
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function deleteProduct(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    // Check if user orders that product before delete
    const orders = await Order.find({ "products.productId": id });
    if (orders.length > 0) {
      return res.status(400).json({ message: "Product has orders" });
    }

    //remove the product's images from the server
    const product = await Product.findById(id);
    if (product && product.images && Array.isArray(product.images)) {
      for (const imgPath of product.images) {
        try {
          const imagePath = path.join(__dirname, "..", "public", imgPath);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (error) {
          console.error("Error deleting image:", error);
          // Continue with product deletion even if image deletion fails
        }
      }
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (deletedProduct) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getProductByCategory(req, res) {
  const { category } = req.params;

  try {
    const products = await Product.find({ category });
    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ message: "No products found in this category" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
