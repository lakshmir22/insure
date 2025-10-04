const express = require('express');
const router = express.Router();
const {
    createPaymentOrder,
    verifyPayment,
    processClaimPayout,
    getPaymentHistory,
    refundPayment
} = require('../../controllers/payments/paymentController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

// All payment routes require authentication
router.use(authenticateToken);

// Payment order management
router.post('/orders', createPaymentOrder);
router.get('/orders/:orderId/verify', verifyPayment);

// Claim payouts
router.post('/claims/:claimId/payout', processClaimPayout);

// Payment history and refunds
router.get('/history', getPaymentHistory);
router.post('/:paymentId/refund', refundPayment);

module.exports = router;
