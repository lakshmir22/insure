const express = require('express');
const router = express.Router();
const {
    createPolicyTemplate,
    getAllPolicyTemplates,
    getProviderPolicyTemplates,
    purchasePolicy,
    getUserPolicies,
    getProviderPolicies,
    getPolicyDetails
} = require('../../controllers/policies/policyController');
const { authenticateToken } = require('../../middlewares/authMiddleware');
const { requireRole } = require('../../middlewares/authMiddleware');

// Public routes
router.get('/templates', getAllPolicyTemplates);

// Protected routes
router.use(authenticateToken);

// Provider routes
router.post('/templates', requireRole(['insurer', 'admin']), createPolicyTemplate);
router.get('/provider/templates', requireRole(['insurer', 'admin']), getProviderPolicyTemplates);
router.get('/provider/policies', requireRole(['insurer', 'admin']), getProviderPolicies);

// Customer routes
router.post('/templates/:templateId/purchase', requireRole(['customer']), purchasePolicy);
router.get('/user/policies', requireRole(['customer']), getUserPolicies);

// Shared routes
router.get('/:policyId', getPolicyDetails);

module.exports = router;
