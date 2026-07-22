const express = require('express');
const router = express.Router();
const prisma = require('../config/db'); 
const {protect, restrictTo} = require('../middleware/authMiddleware'); 

// GET /api/admin/stats
router.get('/stats', protect, restrictTo("admin"), async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);

    res.json({
      success: true,
      data: {
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
      },
    });
  } catch (error) {
    console.error('❌ Statistics API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to aggregate store statistics.' 
    });
  }
});

module.exports = router;