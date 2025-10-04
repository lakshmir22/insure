"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  User,
  FileText,
  CreditCard,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  DollarSign
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface PolicyDetails {
  policy_id: number
  policy_number: string
  policy_type: string
  coverage_amount: number
  premium: number
  start_date: string
  end_date: string
  status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  plan_name: string
  members_count: number
  claims_count: number
  last_claim_date: string | null
  payment_status: string
  risk_score: number
  provider_name: string
  provider_email: string
  created_at: string
  beneficiaries: Beneficiary[]
  documents: Document[]
  claims: Claim[]
  payments: Payment[]
}

interface Beneficiary {
  beneficiary_id: number
  name: string
  relationship: string
  age: number
  gender: string
  aadhar_number: string
  date_of_birth: string
  is_primary: boolean
}

interface Document {
  document_id: number
  document_type: string
  document_name: string
  file_path: string
  file_size: number
  mime_type: string
  is_verified: boolean
  uploaded_at: string
}

interface Claim {
  claim_id: number
  claim_number: string
  claim_type: string
  claim_amount: number
  incident_date: string
  claim_date: string
  status: string
  description: string
  settlement_amount: number | null
  settlement_date: string | null
}

interface Payment {
  payment_id: number
  payment_type: string
  amount: number
  payment_method: string
  payment_reference: string
  payment_date: string
  status: string
  transaction_id: string
}

export default function PolicyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [policy, setPolicy] = useState<PolicyDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const policyId = params.policyId

  useEffect(() => {
    if (policyId) {
      fetchPolicyDetails()
    }
  }, [policyId])

  const fetchPolicyDetails = async () => {
    try {
      setLoading(true)
      
      const response = await apiClient.get(`/policies/${policyId}/details`)
      
      if (response.success) {
        setPolicy(response.data)
      } else {
        throw new Error(response.error || 'Failed to fetch policy details')
      }
    } catch (error: any) {
      console.error('Error fetching policy details:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch policy details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>
      case 'cancelled':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Cancelled</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading policy details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="p-8 space-y-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Policy Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The requested policy could not be found or you don't have access to it.
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{policy.customer_name}</h1>
          <p className="text-muted-foreground">
            {policy.policy_number} • {policy.policy_type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(policy.status)}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Policy Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Premium</p>
                <h3 className="text-2xl font-bold">₹{policy.premium.toLocaleString()}/year</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sum Insured</p>
                <h3 className="text-2xl font-bold">₹{policy.coverage_amount.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiry</p>
                <h3 className="text-2xl font-bold">{new Date(policy.end_date).toLocaleDateString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <h3 className="text-2xl font-bold">{policy.members_count}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Policy Details */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer:</p>
                    <p className="font-medium">{policy.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type:</p>
                    <p className="font-medium">{policy.policy_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Plan:</p>
                    <p className="font-medium">{policy.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Premium:</p>
                    <p className="font-medium">₹{policy.premium.toLocaleString()}/year</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sum Insured:</p>
                    <p className="font-medium">₹{policy.coverage_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date:</p>
                    <p className="font-medium">{new Date(policy.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date:</p>
                    <p className="font-medium">{new Date(policy.end_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status:</p>
                    {getStatusBadge(policy.status)}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Status:</p>
                    {getStatusBadge(policy.payment_status)}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Members:</p>
                    <p className="font-medium">{policy.members_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Claims:</p>
                    <p className="font-medium">{policy.claims_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provider Details */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Provider Name:</p>
                  <p className="font-medium">{policy.provider_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Provider Email:</p>
                  <p className="font-medium">{policy.provider_email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Policy Created:</p>
                  <p className="font-medium">{new Date(policy.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="beneficiaries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Beneficiaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policy.beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.beneficiary_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">{beneficiary.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {beneficiary.relationship} • {beneficiary.age} years • {beneficiary.gender}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Aadhar: {beneficiary.aadhar_number}
                        </p>
                      </div>
                    </div>
                    {beneficiary.is_primary && (
                      <Badge className="bg-blue-100 text-blue-800">Primary</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policy.documents.map((document) => (
                  <div key={document.document_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">{document.document_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {document.document_name} • {formatFileSize(document.file_size)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {document.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
            </CardHeader>
            <CardContent>
              {policy.claims.length > 0 ? (
                <div className="space-y-4">
                  {policy.claims.map((claim) => (
                    <div key={claim.claim_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium">{claim.claim_number}</h4>
                          <p className="text-sm text-muted-foreground">
                            {claim.claim_type} • ₹{claim.claim_amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Incident: {new Date(claim.incident_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(claim.status)}
                        {claim.settlement_amount && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Settled: ₹{claim.settlement_amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Claims Found</h3>
                  <p className="text-muted-foreground">
                    No claims have been filed for this policy yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policy.payments.map((payment) => (
                  <div key={payment.payment_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">{payment.payment_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_method} • {payment.payment_reference}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
