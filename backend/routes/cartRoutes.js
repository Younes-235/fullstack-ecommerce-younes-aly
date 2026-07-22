const express = require('express');
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require('../middleware/authMiddleware');

router.post("/cart", protect, cartController.addToCart);
router.get("/cart", protect, cartController.getCart);

router.put("/cart/:productId", protect, cartController.updateCartQuantity);
router.delete("/cart/:productId", protect, cartController.removeFromCart);

module.exports = router;