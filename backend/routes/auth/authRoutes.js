const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router; 