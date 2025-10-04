const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middlewares/authMiddleware');
const { 
    submitClaim, 
    getUserClaims, 
    getProviderClaims, 
    processClaim, 
    getClaimDetails,
    upload 
} = require('../../controllers/claims/aiClaimController');

// All routes require authentication
router.use(authenticateToken);

// Submit new claim with AI analysis
router.post('/submit', (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                error: 'File upload error',
                details: err.message
            });
        }
        next();
    });
}, submitClaim);

// Get user's claims
router.get('/user', getUserClaims);

// Get provider's claims for review
router.get('/provider', requireRole(['insurer', 'admin']), getProviderClaims);

// Get specific claim details
router.get('/:claimId', getClaimDetails);

// Process claim (approve/reject)
router.post('/:claimId/process', requireRole(['insurer', 'admin']), processClaim);

module.exports = router;
