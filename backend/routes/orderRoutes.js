const express = require('express');
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, restrictTo } = require('../middleware/authMiddleware');
//POST /api/orders

router.post("/orders", protect, orderController.createOrder);

module.exports = router;