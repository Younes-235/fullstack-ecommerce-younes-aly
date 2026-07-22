const express = require('express');
const router = express.Router();
const path = require('path'); 
const productController = require('../controllers/productController');
const feedbackController = require('../controllers/feedbackController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// GET api/products
router.get("/products", productController.getAllProducts);
router.get("/products/categories", productController.getCategories);
// GET api/products/:id
router.get("/products/:id", productController.getProductById);

// POST api/products
router.post("/products", protect, restrictTo('admin'), upload.single('image'), productController.createProduct);
router.get("/products/:id/reviews", feedbackController.getProductFeedback);

router.post("/products/:id/reviews", protect, feedbackController.addFeedback);

router.patch("/products/:id", protect, restrictTo('admin'), productController.updateProductStock);

router.delete("/products/:id", protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;