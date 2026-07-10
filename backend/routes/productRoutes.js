const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

//GET api/products
router.get("/products", productController.getAllProducts);

//GET api/products/:id
router.get("/products/:id", productController.getProductById);

//POST api/products
router.post("/products", protect, restrictTo('admin'), upload.single('image'), productController.createProduct);

router.get("/products/categories", productController.getCategories);
module.exports = router;