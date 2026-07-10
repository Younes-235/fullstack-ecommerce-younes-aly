const express = require('express');
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect, restrictTo } = require('../middleware/authMiddleware');
router.post("/cart", protect,cartController.addToCart);
router.get("/cart", protect, cartController.getCart);

module.exports = router;