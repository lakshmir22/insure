"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { 
  FileText, 
  Upload, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  User,
  CreditCard,
  Building2
} from "lucide-react"

interface Policy {
  policy_id: number
  policy_number: string
  policy_type: string
  coverage_amount: number
  premium: number
  start_date: string
  end_date: string
  status: string
}

interface ABDMRecord {
  patientId: string
  fullName: string
  medicalRecords: Array<{
    recordId: string
    hospitalName: string
    diagnosis: string
    treatment: string
    totalAmount: number
    admissionDate: string
    dischargeDate: string
  }>
}

export default function SubmitClaimPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [abdmRecords, setAbdmRecords] = useState<ABDMRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [abdmLoading, setAbdmLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("policy")
  const [documents, setDocuments] = useState<File[]>([])
  const [documentTypes, setDocumentTypes] = useState<string[]>([])

  const { toast } = useToast()
  const router = useRouter()

  // Form data
  const [formData, setFormData] = useState({
    abdmId: "",
    claimAmount: "",
    incidentDate: "",
    claimDescription: "",
    hospitalName: "",
    treatmentDetails: "",
    bankAccount: "",
    ifscCode: "",
    beneficiaryName: ""
  })

  useEffect(() => {
    fetchUserPolicies()
  }, [])

  const fetchUserPolicies = async () => {
    try {
      const response = await apiClient.get('/policies/user/policies')
      if (response.success) {
        setPolicies(response.data)
      }
    } catch (error) {
      console.error('Error fetching policies:', error)
    }
  }

  const fetchABDMRecords = async () => {
    if (!formData.abdmId) return

    setAbdmLoading(true)
    try {
      // Mock ABDM data for testing
      const mockABDMData = {
        'ABDM123456789': {
          patientId: 'ABDM123456789',
          fullName: 'Rajesh Kumar',
          medicalRecords: [
            {
              recordId: 'MR001',
              hospitalName: 'Apollo Hospital, Delhi',
              diagnosis: 'Acute Myocardial Infarction (Heart Attack)',
              treatment: 'Angioplasty with Stent Placement',
              totalAmount: 450000,
              admissionDate: '2024-01-15',
              dischargeDate: '2024-01-20'
            }
          ]
        }
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (mockABDMData[formData.abdmId]) {
        setAbdmRecords(mockABDMData[formData.abdmId])
        toast({
          title: "ABDM Records Found",
          description: "Medical records fetched successfully from ABDM system"
        })
      } else {
        toast({
          title: "ABDM Records Not Found",
          description: "No records found for this ABDM ID. Please check the ID or try: ABDM123456789",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ABDM records",
        variant: "destructive"
      })
    } finally {
      setAbdmLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDocuments(prev => [...prev, ...files])
    setDocumentTypes(prev => [...prev, ...new Array(files.length).fill('')])
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
    setDocumentTypes(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!selectedPolicy) {
      toast({
        title: "Error",
        description: "Please select a policy",
        variant: "destructive"
      })
      return
    }

    if (!formData.abdmId || !formData.claimAmount || !formData.incidentDate || !formData.claimDescription) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      
      // Add form data
      formDataToSend.append('policyId', selectedPolicy.policy_id.toString())
      formDataToSend.append('abdmId', formData.abdmId)
      formDataToSend.append('claimAmount', formData.claimAmount)
      formDataToSend.append('incidentDate', formData.incidentDate)
      formDataToSend.append('claimDescription', formData.claimDescription)
      formDataToSend.append('hospitalName', formData.hospitalName)
      formDataToSend.append('treatmentDetails', formData.treatmentDetails)
      formDataToSend.append('bankAccount', formData.bankAccount)
      formDataToSend.append('ifscCode', formData.ifscCode)
      formDataToSend.append('beneficiaryName', formData.beneficiaryName)

      // Add documents
      documents.forEach((file, index) => {
        formDataToSend.append(`document_${index}`, file)
        formDataToSend.append(`document_type_${index}`, documentTypes[index] || 'Supporting Document')
      })

      const response = await apiClient.post('/ai-claims/submit', formDataToSend)

      if (response.success) {
        toast({
          title: "Claim Submitted Successfully",
          description: response.data.message
        })
        router.push('/dashboard/user/claims/success')
      } else {
        throw new Error(response.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit claim",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Submit Insurance Claim</h1>
        <p className="text-muted-foreground mt-2">
          Submit a new insurance claim with AI-powered analysis
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policy">Select Policy</TabsTrigger>
          <TabsTrigger value="abdm">ABDM Records</TabsTrigger>
          <TabsTrigger value="details">Claim Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="policy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Select Your Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <p className="text-muted-foreground">No policies found. Please purchase a policy first.</p>
              ) : (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div
                      key={policy.policy_id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPolicy?.policy_id === policy.policy_id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{policy.policy_number}</h3>
                          <p className="text-sm text-muted-foreground">{policy.policy_type}</p>
                          <p className="text-sm">Coverage: ₹{policy.coverage_amount.toLocaleString()}</p>
                        </div>
                        <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                          {policy.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abdm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                ABDM Medical Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ABDM ID (e.g., ABDM123456789)"
                  value={formData.abdmId}
                  onChange={(e) => setFormData(prev => ({ ...prev, abdmId: e.target.value }))}
                />
                <Button onClick={fetchABDMRecords} disabled={abdmLoading}>
                  {abdmLoading ? "Fetching..." : "Fetch Records"}
                </Button>
              </div>

              {abdmRecords && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800">{abdmRecords.fullName}</h3>
                    <p className="text-sm text-green-600">ABDM ID: {abdmRecords.patientId}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Medical Records:</h4>
                    {abdmRecords.medicalRecords.map((record, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h5 className="font-medium">{record.hospitalName}</h5>
                        <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                        <p className="text-sm">Treatment: {record.treatment}</p>
                        <p className="text-sm">Amount: ₹{record.totalAmount.toLocaleString()}</p>
                        <p className="text-sm">
                          {record.admissionDate} - {record.dischargeDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Claim Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="claimAmount">Claim Amount (₹) *</Label>
                  <Input
                    id="claimAmount"
                    type="number"
                    value={formData.claimAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, claimAmount: e.target.value }))}
                    placeholder="Enter claim amount"
                  />
                </div>
                <div>
                  <Label htmlFor="incidentDate">Incident Date *</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, incidentDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
                  placeholder="Enter hospital name"
                />
              </div>

              <div>
                <Label htmlFor="treatmentDetails">Treatment Details</Label>
                <Textarea
                  id="treatmentDetails"
                  value={formData.treatmentDetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatmentDetails: e.target.value }))}
                  placeholder="Describe the treatment received"
                />
              </div>

              <div>
                <Label htmlFor="claimDescription">Claim Description *</Label>
                <Textarea
                  id="claimDescription"
                  value={formData.claimDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, claimDescription: e.target.value }))}
                  placeholder="Describe the incident and reason for claim"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankAccount">Bank Account Number</Label>
                  <Input
                    id="bankAccount"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                    placeholder="Enter bank account number"
                  />
                </div>
                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                <Input
                  id="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                  placeholder="Enter beneficiary name"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="documents">Upload Supporting Documents</Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload medical reports, bills, prescriptions, etc.
                </p>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Uploaded Documents:</h4>
                  {documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={documentTypes[index] || ''}
                          onValueChange={(value) => {
                            const newTypes = [...documentTypes]
                            newTypes[index] = value
                            setDocumentTypes(newTypes)
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Medical Report">Medical Report</SelectItem>
                            <SelectItem value="Hospital Bill">Hospital Bill</SelectItem>
                            <SelectItem value="Prescription">Prescription</SelectItem>
                            <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                            <SelectItem value="Lab Report">Lab Report</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedPolicy}
          className="w-full sm:w-auto"
        >
          {loading ? "Submitting Claim..." : "Submit Claim"}
        </Button>
      </div>
    </div>
  )
}
