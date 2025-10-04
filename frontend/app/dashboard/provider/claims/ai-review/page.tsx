"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  User,
  Calendar,
  DollarSign,
  Shield,
  Brain,
  TrendingUp
} from "lucide-react"

interface Claim {
  claim_id: number
  policy_number: string
  policy_type: string
  claim_amount: number
  filing_date: string
  claim_status: string
  claimant_name: string
  claimant_email: string
  hospital_name: string
  treatment_details: string
  abdm_data: any
  ai_analysis: {
    fraudScore: number
    riskLevel: string
    isValidClaim: boolean
    confidence: number
    analysis: {
      medicalConsistency: string
      amountValidation: string
      documentAuthenticity: string
      timelineValidation: string
      policyCompliance: string
    }
    redFlags: string[]
    recommendations: string[]
    summary: string
  }
  fraud_score: number
  risk_level: string
  ai_confidence: number
}

export default function AIClaimReviewPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [comments, setComments] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/ai-claims/provider')
      if (response.success) {
        setClaims(response.data)
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
      toast({
        title: "Error",
        description: "Failed to fetch claims",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const processClaim = async (claimId: number, action: 'approve' | 'reject') => {
    try {
      setProcessing(true)
      const response = await apiClient.post(`/ai-claims/${claimId}/process`, {
        action,
        comments
      })

      if (response.success) {
        toast({
          title: action === 'approve' ? "Claim Approved" : "Claim Rejected",
          description: response.data.message
        })
        fetchClaims()
        setSelectedClaim(null)
        setComments("")
      } else {
        throw new Error(response.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process claim",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_ai_analysis': return 'bg-blue-100 text-blue-800'
      case 'pending_provider_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'rejected_by_ai': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading claims...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI-Powered Claim Review</h1>
        <p className="text-muted-foreground mt-2">
          Review and process insurance claims with AI analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claims List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Claims ({claims.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {claims.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No claims found</p>
              ) : (
                claims.map((claim) => (
                  <div
                    key={claim.claim_id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedClaim?.claim_id === claim.claim_id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedClaim(claim)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">#{claim.claim_id}</h3>
                      <Badge className={getStatusColor(claim.claim_status)}>
                        {claim.claim_status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{claim.claimant_name}</p>
                    <p className="text-sm font-medium">₹{claim.claim_amount.toLocaleString()}</p>
                    {claim.ai_analysis && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getRiskColor(claim.risk_level)}>
                          {claim.risk_level} RISK
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {claim.fraud_score}% fraud score
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Claim Details */}
        <div className="lg:col-span-2">
          {selectedClaim ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="abdm-records">ABDM Records</TabsTrigger>
                <TabsTrigger value="action">Action</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Claim Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Claim ID</Label>
                        <p className="text-sm">#{selectedClaim.claim_id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Policy Number</Label>
                        <p className="text-sm">{selectedClaim.policy_number}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Claimant</Label>
                        <p className="text-sm">{selectedClaim.claimant_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{selectedClaim.claimant_email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Claim Amount</Label>
                        <p className="text-sm font-semibold">₹{selectedClaim.claim_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Filing Date</Label>
                        <p className="text-sm">{new Date(selectedClaim.filing_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {selectedClaim.hospital_name && (
                      <div>
                        <Label className="text-sm font-medium">Hospital</Label>
                        <p className="text-sm">{selectedClaim.hospital_name}</p>
                      </div>
                    )}

                    {selectedClaim.treatment_details && (
                      <div>
                        <Label className="text-sm font-medium">Treatment Details</Label>
                        <p className="text-sm">{selectedClaim.treatment_details}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-analysis" className="space-y-4">
                {selectedClaim.ai_analysis ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          AI Analysis Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {selectedClaim.fraud_score}%
                            </div>
                            <div className="text-sm text-muted-foreground">Fraud Score</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedClaim.ai_confidence}%
                            </div>
                            <div className="text-sm text-muted-foreground">AI Confidence</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Risk Level</Label>
                            <Badge className={getRiskColor(selectedClaim.risk_level)}>
                              {selectedClaim.risk_level}
                            </Badge>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Valid Claim</Label>
                            <div className="flex items-center gap-2">
                              {selectedClaim.ai_analysis.isValidClaim ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm">
                                {selectedClaim.ai_analysis.isValidClaim ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Summary</Label>
                          <p className="text-sm mt-1">{selectedClaim.ai_analysis.summary}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Medical Consistency</Label>
                          <p className="text-sm mt-1">{selectedClaim.ai_analysis.analysis.medicalConsistency}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Amount Validation</Label>
                          <p className="text-sm mt-1">{selectedClaim.ai_analysis.analysis.amountValidation}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Document Authenticity</Label>
                          <p className="text-sm mt-1">{selectedClaim.ai_analysis.analysis.documentAuthenticity}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Timeline Validation</Label>
                          <p className="text-sm mt-1">{selectedClaim.ai_analysis.analysis.timelineValidation}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Policy Compliance</Label>
                          <p className="text-sm mt-1">{selectedClaim.ai_analysis.analysis.policyCompliance}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedClaim.ai_analysis.redFlags.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Red Flags
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {selectedClaim.ai_analysis.redFlags.map((flag, index) => (
                              <li key={index} className="text-sm text-red-600">• {flag}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {selectedClaim.ai_analysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm">• {rec}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">AI analysis not available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="abdm-records" className="space-y-4">
                {selectedClaim.abdm_data ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>ABDM Medical Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Patient Name</Label>
                          <p className="text-sm">{selectedClaim.abdm_data.fullName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">ABDM ID</Label>
                          <p className="text-sm">{selectedClaim.abdm_data.patientId}</p>
                        </div>
                        
                        {selectedClaim.abdm_data.medicalRecords && (
                          <div>
                            <Label className="text-sm font-medium">Medical Records</Label>
                            <div className="space-y-3 mt-2">
                              {selectedClaim.abdm_data.medicalRecords.map((record: any, index: number) => (
                                <div key={index} className="p-3 border rounded-lg">
                                  <h4 className="font-medium">{record.hospitalName}</h4>
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
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">ABDM records not available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="action" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Process Claim</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="comments">Comments</Label>
                      <Textarea
                        id="comments"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add your comments about this claim..."
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => processClaim(selectedClaim.claim_id, 'approve')}
                        disabled={processing || selectedClaim.claim_status !== 'pending_provider_review'}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Claim
                      </Button>
                      <Button
                        onClick={() => processClaim(selectedClaim.claim_id, 'reject')}
                        disabled={processing || selectedClaim.claim_status !== 'pending_provider_review'}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Claim
                      </Button>
                    </div>

                    {selectedClaim.claim_status !== 'pending_provider_review' && (
                      <p className="text-sm text-muted-foreground">
                        This claim has already been processed.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Select a claim to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
