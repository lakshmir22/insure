const axios = require('axios');

class PaymentService {
    constructor() {
        // Initialize Cashfree credentials (sandbox)
        this.clientId = process.env.CASHFREE_CLIENT_ID || 'TEST_CLIENT_ID';
        this.clientSecret = process.env.CASHFREE_CLIENT_SECRET || 'TEST_CLIENT_SECRET';
        this.environment = process.env.CASHFREE_ENV || 'SANDBOX';
        this.baseUrl = this.environment === 'PRODUCTION' 
            ? 'https://api.cashfree.com/pg' 
            : 'https://sandbox.cashfree.com/pg';
    }

    // Create payment order for policy purchase
    async createPaymentOrder(paymentData) {
        try {
            const {
                orderId,
                amount,
                currency = 'INR',
                customerDetails,
                policyDetails
            } = paymentData;

            // Mock implementation for development
            // In production, you would make API call to Cashfree
            const mockResponse = {
                orderId: orderId,
                paymentStatus: 'PENDING',
                paymentUrl: `https://sandbox.cashfree.com/pay/${orderId}`,
                cfPaymentId: `cf_payment_${Date.now()}`,
                createdAt: new Date().toISOString()
            };

            return {
                success: true,
                data: mockResponse
            };

        } catch (error) {
            console.error('Error creating payment order:', error);
            throw error;
        }
    }

    // Verify payment status
    async verifyPayment(orderId) {
        try {
            // In a real implementation, you would call Cashfree API to verify payment
            // For now, we'll simulate different payment statuses
            const mockStatuses = ['PENDING', 'SUCCESS', 'FAILED'];
            const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];

            const mockResponse = {
                orderId: orderId,
                paymentStatus: randomStatus,
                cfPaymentId: `cf_payment_${Date.now()}`,
                paymentAmount: 1000, // Mock amount
                paymentCurrency: 'INR',
                paymentTime: new Date().toISOString(),
                paymentMessage: randomStatus === 'SUCCESS' ? 'Payment successful' : 'Payment failed'
            };

            return {
                success: true,
                data: mockResponse
            };

        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    // Process claim payout
    async processClaimPayout(payoutData) {
        try {
            const {
                claimId,
                amount,
                beneficiaryDetails,
                policyDetails
            } = payoutData;

            // In a real implementation, you would call Cashfree Payout API here
            // For now, we'll simulate the response
            const mockResponse = {
                payoutId: `payout_${Date.now()}`,
                claimId: claimId,
                amount: amount,
                status: 'PENDING',
                beneficiaryAccount: beneficiaryDetails.accountNumber,
                beneficiaryIfsc: beneficiaryDetails.ifscCode,
                createdAt: new Date().toISOString()
            };

            return {
                success: true,
                data: mockResponse
            };

        } catch (error) {
            console.error('Error processing claim payout:', error);
            throw error;
        }
    }

    // Get payment history
    async getPaymentHistory(userId, limit = 10, offset = 0) {
        try {
            // In a real implementation, you would fetch from Cashfree API
            // For now, we'll return mock data
            const mockPayments = [
                {
                    paymentId: `payment_${Date.now()}`,
                    orderId: `order_${Date.now()}`,
                    amount: 5000,
                    currency: 'INR',
                    status: 'SUCCESS',
                    description: 'Health Insurance Premium',
                    createdAt: new Date().toISOString()
                }
            ];

            return {
                success: true,
                data: mockPayments
            };

        } catch (error) {
            console.error('Error fetching payment history:', error);
            throw error;
        }
    }

    // Refund payment
    async refundPayment(paymentId, amount, reason) {
        try {
            // In a real implementation, you would call Cashfree Refund API
            const mockResponse = {
                refundId: `refund_${Date.now()}`,
                paymentId: paymentId,
                amount: amount,
                reason: reason,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };

            return {
                success: true,
                data: mockResponse
            };

        } catch (error) {
            console.error('Error processing refund:', error);
            throw error;
        }
    }
}

module.exports = PaymentService;
