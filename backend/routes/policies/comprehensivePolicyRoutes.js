const express = require('express');
const router = express.Router();
const {
    purchaseComprehensivePolicy,
    getPolicyDetails,
    upload
} = require('../../controllers/policies/comprehensivePolicyController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Comprehensive policy purchase with file uploads
router.post('/purchase-comprehensive', (req, res, next) => {
    // Use any() to accept files with any field name
    upload.any()(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                error: 'File upload error',
                details: err.message
            });
        }
        console.log('Files received:', req.files);
        next();
    });
}, purchaseComprehensivePolicy);

// Get detailed policy information
router.get('/:policyId/details', getPolicyDetails);

module.exports = router;
