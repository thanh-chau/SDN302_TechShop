const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");

const getOrCreateCategory = async (name) => {
  if (!name || !String(name).trim()) return null;
  const n = String(name).trim();
  let cat = await Category.findOne({ name: n });
  if (!cat) cat = await Category.create({ name: n });
  return cat._id;
};

const getOrCreateBrand = async (name) => {
  const n = (name || "TechShop").trim();
  let brand = await Brand.findOne({ name: n });
  if (!brand) brand = await Brand.create({ name: n });
  return brand._id;
};

// Derive 3-state status from isActive + stock
const deriveStatus = (isActive, stock) => {
  if (!isActive) return "discontinued"; // Ngừng bán
  if (stock <= 0) return "outofstock"; // Hết hàng
  return "active"; // Còn hàng
};

// Home page: only show "còn hàng" (isActive=true AND stock>0)
const list = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
      .populate("category", "name")
      .populate("brand", "name")
      .lean();
    const list = products.map((p) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      stockQuantity: p.stock,
      category: p.category?.name || p.category,
      imgUrl: p.images?.[0] || null,
      image: p.images?.[0] || null,
      isActive: p.isActive,
      productStatus: deriveStatus(p.isActive, p.stock),
    }));
    res.json(list);
  } catch (err) {
    console.error("Product list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/Staff: show all products with full status info
const listAll = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("brand", "name")
      .lean();
    const list = products.map((p) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      stockQuantity: p.stock,
      category: p.category?.name || p.category,
      imgUrl: p.images?.[0] || null,
      image: p.images?.[0] || null,
      isActive: p.isActive,
      productStatus: deriveStatus(p.isActive, p.stock),
    }));
    res.json(list);
  } catch (err) {
    console.error("Product listAll error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const create = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stockQuantity,
      stock,
      category,
      status,
      imgUrl,
    } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ message: "Thiếu tên hoặc giá" });
    }
    const categoryName = category || "Khác";
    const categoryId = await getOrCreateCategory(categoryName);
    const brandId = await getOrCreateBrand("TechShop");
    const product = await Product.create({
      name,
      description: description || "",
      price: Number(price),
      stock: Number(stockQuantity ?? stock ?? 0),
      images: imgUrl ? [imgUrl] : [],
      category: categoryId,
      brand: brandId,
      isActive: status !== "INACTIVE" && status !== "inactive",
    });
    res.status(201).json({
      id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      imgUrl: product.images?.[0] || null,
    });
  } catch (err) {
    console.error("Product create error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const update = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      stockQuantity,
      stock,
      category,
      status,
      imgUrl,
    } = req.body;
    if (!id) return res.status(400).json({ message: "Thiếu id sản phẩm" });
    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    if (name != null) product.name = name;
    if (description != null) product.description = description;
    if (price != null) product.price = Number(price);
    if (stockQuantity != null || stock != null)
      product.stock = Number(stockQuantity ?? stock ?? product.stock);
    if (category != null) {
      product.category = await getOrCreateCategory(category);
    }
    if (imgUrl != null) product.images = [imgUrl];
    if (status != null)
      product.isActive = status !== "INACTIVE" && status !== "inactive";
    await product.save();
    res.json({
      id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      imgUrl: product.images?.[0] || null,
    });
  } catch (err) {
    console.error("Product update error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    product.isActive = false;
    await product.save();
    res.json({ message: "Đã ẩn sản phẩm" });
  } catch (err) {
    console.error("Product delete error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports = { list, listAll, create, update, remove };
