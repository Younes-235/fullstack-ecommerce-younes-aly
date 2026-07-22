const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/profile').get(userController.getUserProfile)
router.route('/profile').put(userController.updateUserProfile);

module.exports = router;