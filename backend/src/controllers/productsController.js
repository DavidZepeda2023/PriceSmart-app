const productsController = {};
import productsModel from "../models/Products.js";

// SELECT ALL
productsController.getProducts = async (req, res) => {
  try {
    const products = await productsModel.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SELECT ONE
productsController.getSingleProduct = async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// INSERT
productsController.createProducts = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const newProduct = new productsModel({ name, description, price, stock });
    await newProduct.save();
    res.json({ message: "Product saved", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
productsController.updateProducts = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const updated = await productsModel.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stock },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Product updated", product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
productsController.deleteProducts = async (req, res) => {
  try {
    const deletedProduct = await productsModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default productsController;
