/**
 * Cashfree Payout Service for Insurance Claim Payments
 * Handles automatic payouts to user accounts
 */

const axios = require('axios');

class CashfreePayoutService {
    constructor() {
        this.appId = process.env.CASHFREE_APP_ID || 'your-app-id';
        this.secretKey = process.env.CASHFREE_SECRET_KEY || 'your-secret-key';
        this.baseUrl = process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/payout';
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    /**
     * Initialize payout to user account
     * @param {Object} payoutData - Payout details
     * @returns {Promise<Object>} Payout result
     */
    async initiatePayout(payoutData) {
        try {
            const {
                claimId,
                userId,
                amount,
                beneficiaryName,
                bankAccount,
                ifscCode,
                phone,
                email,
                purpose = 'Insurance Claim Settlement'
            } = payoutData;

            // Generate unique payout ID
            const payoutId = `PAYOUT_${claimId}_${Date.now()}`;

            const payload = {
                beneId: `BENE_${userId}_${Date.now()}`,
                beneIdType: 'BENE_ID',
                amount: amount,
                transferId: payoutId,
                transferMode: 'banktransfer',
                remarks: `Insurance claim settlement for claim ${claimId}`,
                bankAccount: bankAccount,
                ifsc: ifscCode,
                beneName: beneficiaryName,
                phone: phone,
                email: email,
                purpose: purpose
            };

            const headers = {
                'X-Client-Id': this.appId,
                'X-Client-Secret': this.secretKey,
                'X-Request-Id': payoutId,
                'Content-Type': 'application/json'
            };

            console.log('Initiating Cashfree payout:', payload);

            // For sandbox, return mock response
            if (!this.isProduction) {
                return this.getMockPayoutResponse(payoutId, amount);
            }

            const response = await axios.post(
                `${this.baseUrl}/v1/transfers`,
                payload,
                { headers }
            );

            return {
                success: true,
                data: {
                    payoutId,
                    transferId: payoutId,
                    amount,
                    status: 'PENDING',
                    response: response.data
                }
            };

        } catch (error) {
            console.error('Cashfree Payout Error:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Check payout status
     * @param {string} payoutId - Payout ID to check
     * @returns {Promise<Object>} Payout status
     */
    async checkPayoutStatus(payoutId) {
        try {
            if (!this.isProduction) {
                return this.getMockPayoutStatus(payoutId);
            }

            const headers = {
                'X-Client-Id': this.appId,
                'X-Client-Secret': this.secretKey,
                'Content-Type': 'application/json'
            };

            const response = await axios.get(
                `${this.baseUrl}/v1/transfers/${payoutId}`,
                { headers }
            );

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('Cashfree Status Check Error:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Get mock payout response for sandbox testing
     */
    getMockPayoutResponse(payoutId, amount) {
        return {
            success: true,
            data: {
                payoutId,
                transferId: payoutId,
                amount,
                status: 'PENDING',
                utr: `MOCK_UTR_${Date.now()}`,
                response: {
                    status: 'SUCCESS',
                    subCode: '200',
                    message: 'Transfer initiated successfully',
                    data: {
                        transferId: payoutId,
                        status: 'PENDING',
                        utr: `MOCK_UTR_${Date.now()}`
                    }
                }
            }
        };
    }

    /**
     * Get mock payout status for sandbox testing
     */
    getMockPayoutStatus(payoutId) {
        // Simulate different statuses based on payout ID
        const statuses = ['PENDING', 'SUCCESS', 'FAILED'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        return {
            success: true,
            data: {
                transferId: payoutId,
                status: randomStatus,
                utr: `MOCK_UTR_${Date.now()}`,
                amount: 50000,
                fees: 10,
                tax: 1.8,
                transferTime: new Date().toISOString(),
                remarks: 'Insurance claim settlement'
            }
        };
    }

    /**
     * Validate bank account details
     * @param {Object} accountDetails - Bank account details
     * @returns {Promise<Object>} Validation result
     */
    async validateBankAccount(accountDetails) {
        try {
            const { accountNumber, ifscCode } = accountDetails;

            // Basic validation
            if (!accountNumber || !ifscCode) {
                return {
                    success: false,
                    error: 'Account number and IFSC code are required'
                };
            }

            if (accountNumber.length < 9 || accountNumber.length > 18) {
                return {
                    success: false,
                    error: 'Invalid account number length'
                };
            }

            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
                return {
                    success: false,
                    error: 'Invalid IFSC code format'
                };
            }

            // For sandbox, always return success
            return {
                success: true,
                data: {
                    isValid: true,
                    bankName: 'Mock Bank',
                    branchName: 'Mock Branch',
                    accountHolderName: 'Mock Account Holder'
                }
            };

        } catch (error) {
            console.error('Bank Account Validation Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = CashfreePayoutService;
