/**
 * ABDM (Ayushman Bharat Digital Mission) Mock Service
 * Simulates fetching patient records from ABDM system
 */

class ABDMService {
    constructor() {
        this.mockRecords = {
            // Mock ABDM ID with sample medical records
            'ABDM123456789': {
                patientId: 'ABDM123456789',
                fullName: 'Rajesh Kumar',
                dateOfBirth: '1985-03-15',
                gender: 'Male',
                address: '123, Sector 5, Delhi',
                phone: '+91-9876543210',
                aadharNumber: '123456789012',
                medicalRecords: [
                    {
                        recordId: 'MR001',
                        hospitalName: 'Apollo Hospital, Delhi',
                        admissionDate: '2024-01-15',
                        dischargeDate: '2024-01-20',
                        diagnosis: 'Acute Myocardial Infarction (Heart Attack)',
                        icd10Code: 'I21.9',
                        treatment: 'Angioplasty with Stent Placement',
                        totalAmount: 450000,
                        insuranceClaimed: 400000,
                        documents: [
                            {
                                type: 'Discharge Summary',
                                url: 'https://abdm.gov.in/documents/discharge_001.pdf',
                                uploadedDate: '2024-01-21'
                            },
                            {
                                type: 'Lab Reports',
                                url: 'https://abdm.gov.in/documents/lab_001.pdf',
                                uploadedDate: '2024-01-21'
                            },
                            {
                                type: 'ECG Report',
                                url: 'https://abdm.gov.in/documents/ecg_001.pdf',
                                uploadedDate: '2024-01-21'
                            }
                        ]
                    },
                    {
                        recordId: 'MR002',
                        hospitalName: 'Fortis Hospital, Mumbai',
                        admissionDate: '2023-08-10',
                        dischargeDate: '2023-08-15',
                        diagnosis: 'Type 2 Diabetes with Complications',
                        icd10Code: 'E11.9',
                        treatment: 'Insulin Therapy and Dietary Management',
                        totalAmount: 25000,
                        insuranceClaimed: 20000,
                        documents: [
                            {
                                type: 'Blood Sugar Reports',
                                url: 'https://abdm.gov.in/documents/blood_sugar_001.pdf',
                                uploadedDate: '2023-08-16'
                            }
                        ]
                    }
                ],
                currentMedications: [
                    'Metformin 500mg',
                    'Aspirin 75mg',
                    'Atorvastatin 20mg'
                ],
                allergies: ['Penicillin', 'Shellfish'],
                emergencyContact: {
                    name: 'Priya Kumar',
                    relationship: 'Wife',
                    phone: '+91-9876543211'
                }
            },
            'ABDM987654321': {
                patientId: 'ABDM987654321',
                fullName: 'Priya Sharma',
                dateOfBirth: '1990-07-22',
                gender: 'Female',
                address: '456, MG Road, Bangalore',
                phone: '+91-9876543212',
                aadharNumber: '987654321098',
                medicalRecords: [
                    {
                        recordId: 'MR003',
                        hospitalName: 'Manipal Hospital, Bangalore',
                        admissionDate: '2024-02-10',
                        dischargeDate: '2024-02-15',
                        diagnosis: 'Appendicitis with Peritonitis',
                        icd10Code: 'K35.9',
                        treatment: 'Laparoscopic Appendectomy',
                        totalAmount: 180000,
                        insuranceClaimed: 150000,
                        documents: [
                            {
                                type: 'Surgery Report',
                                url: 'https://abdm.gov.in/documents/surgery_001.pdf',
                                uploadedDate: '2024-02-16'
                            },
                            {
                                type: 'CT Scan Report',
                                url: 'https://abdm.gov.in/documents/ct_001.pdf',
                                uploadedDate: '2024-02-16'
                            }
                        ]
                    }
                ],
                currentMedications: [
                    'Paracetamol 500mg',
                    'Ibuprofen 400mg'
                ],
                allergies: ['Latex'],
                emergencyContact: {
                    name: 'Rahul Sharma',
                    relationship: 'Brother',
                    phone: '+91-9876543213'
                }
            }
        };
    }

    /**
     * Fetch patient records by ABDM ID
     * @param {string} abdmId - ABDM ID of the patient
     * @returns {Promise<Object>} Patient records
     */
    async fetchPatientRecords(abdmId) {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (!this.mockRecords[abdmId]) {
                throw new Error('Patient not found in ABDM system');
            }

            return {
                success: true,
                data: this.mockRecords[abdmId],
                message: 'Patient records fetched successfully'
            };
        } catch (error) {
            console.error('ABDM Service Error:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Validate ABDM ID format
     * @param {string} abdmId - ABDM ID to validate
     * @returns {boolean} True if valid format
     */
    validateABDMId(abdmId) {
        // ABDM ID format: ABDM followed by 9 digits
        const abdmRegex = /^ABDM\d{9}$/;
        return abdmRegex.test(abdmId);
    }

    /**
     * Get available mock ABDM IDs for testing
     * @returns {Array} List of mock ABDM IDs
     */
    getAvailableABDMIds() {
        return Object.keys(this.mockRecords);
    }
}

module.exports = ABDMService;
