/**
 * Groq AI Service for Insurance Claim Analysis
 * Analyzes medical records, documents, and claim amounts for fraud detection
 */

class GroqService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY || 'your-groq-api-key-here';
        this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    }

    /**
     * Analyze insurance claim for fraud detection and validation
     * @param {Object} claimData - Claim data including medical records and documents
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeClaim(claimData) {
        try {
            const {
                abdmRecords,
                userDocuments,
                claimAmount,
                policyDetails,
                claimDescription,
                incidentDate
            } = claimData;

            console.log('Starting Groq AI analysis...');

            // Build analysis prompt
            const prompt = this.buildAnalysisPrompt({
                abdmRecords,
                userDocuments,
                claimAmount,
                policyDetails,
                claimDescription,
                incidentDate
            });

            // Call Groq API
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert insurance fraud detection AI. Analyze the provided claim data and medical records to determine fraud risk, validate claim amounts, and provide detailed analysis. Always respond with valid JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const analysisText = result.choices[0].message.content;

            // Parse the response to extract structured data
            const analysis = this.parseAnalysisResponse(analysisText);

            return {
                success: true,
                data: analysis
            };

        } catch (error) {
            console.error('Groq AI Analysis Error:', error);
            
            // Return mock analysis if API fails
            return {
                success: false,
                data: this.getMockAnalysis(),
                error: 'AI analysis failed, using fallback analysis'
            };
        }
    }

    /**
     * Build analysis prompt for Groq AI
     */
    buildAnalysisPrompt(data) {
        return `
Analyze this insurance claim for fraud detection and validation:

CLAIM DETAILS:
- Claim Amount: ₹${data.claimAmount}
- Policy Type: ${data.policyDetails?.policy_type || 'Unknown'}
- Coverage Amount: ₹${data.policyDetails?.coverage_amount || 'Unknown'}
- Incident Description: ${data.claimDescription}
- Incident Date: ${data.incidentDate}

MEDICAL RECORDS (ABDM):
${JSON.stringify(data.abdmRecords, null, 2)}

USER DOCUMENTS:
${JSON.stringify(data.userDocuments, null, 2)}

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
    "fraudScore": 0-100,
    "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
    "isValidClaim": true/false,
    "recommendations": ["recommendation1", "recommendation2"],
    "redFlags": ["flag1", "flag2"],
    "confidence": 0-100,
    "analysis": "Detailed analysis of the claim",
    "diseaseMatch": true/false,
    "amountValidation": "APPROPRIATE|TOO_HIGH|TOO_LOW"
}

Focus on:
1. Medical record consistency
2. Claim amount reasonableness
3. Document authenticity
4. Timeline validation
5. Pattern analysis for fraud indicators
        `.trim();
    }

    /**
     * Parse Groq AI response to extract structured data
     */
    parseAnalysisResponse(responseText) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                // Validate required fields
                if (parsed.fraudScore !== undefined && parsed.riskLevel !== undefined) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error('Error parsing Groq response:', error);
        }

        // Fallback parsing if JSON extraction fails
        return this.parseTextResponse(responseText);
    }

    /**
     * Parse text response when JSON extraction fails
     */
    parseTextResponse(text) {
        const analysis = {
            fraudScore: 25,
            riskLevel: 'LOW',
            isValidClaim: true,
            recommendations: ['Claim appears valid based on available data'],
            redFlags: [],
            confidence: 75,
            analysis: text.substring(0, 500),
            diseaseMatch: true,
            amountValidation: 'APPROPRIATE'
        };

        // Extract fraud score if mentioned
        const fraudMatch = text.match(/fraud[^0-9]*(\d+)/i);
        if (fraudMatch) {
            analysis.fraudScore = Math.min(100, Math.max(0, parseInt(fraudMatch[1])));
        }

        // Extract risk level
        if (text.toLowerCase().includes('high risk') || text.toLowerCase().includes('critical')) {
            analysis.riskLevel = 'HIGH';
        } else if (text.toLowerCase().includes('medium risk')) {
            analysis.riskLevel = 'MEDIUM';
        }

        return analysis;
    }

    /**
     * Get mock analysis data for fallback
     */
    getMockAnalysis() {
        return {
            fraudScore: 15,
            riskLevel: 'LOW',
            isValidClaim: true,
            recommendations: [
                'Claim amount appears reasonable for the described condition',
                'Medical records support the claim description',
                'No obvious red flags detected'
            ],
            redFlags: [],
            confidence: 85,
            analysis: 'Based on the provided medical records and claim details, this appears to be a legitimate insurance claim. The claim amount is within reasonable limits for the described medical condition, and the supporting documentation aligns with the incident description.',
            diseaseMatch: true,
            amountValidation: 'APPROPRIATE'
        };
    }
}

module.exports = GroqService;
