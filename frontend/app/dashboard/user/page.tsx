"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Download,
  RefreshCw,
  ShoppingCart,
  Copy
} from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"

interface Policy {
  policy_id: number
  policy_number: string
  policy_type: string
  coverage_amount: number
  premium: number
  start_date: string
  end_date: string
  status: string
  provider_name: string
  provider_email: string
  created_at: string
}

interface Claim {
  claim_id: number
  claim_number: string
  policy_id: number
  policy_number: string
  claim_type: string
  amount: number
  status: string
  description: string
  incident_date: string
  created_at: string
  processed_at: string | null
}

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [policies, setPolicies] = useState<Policy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const userName = user?.fullName || "User"

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [policiesRes, claimsRes] = await Promise.all([
        apiClient.get('/policies/user/policies'),
        apiClient.get('/claims/me')
      ])

      if (policiesRes.success && policiesRes.data) {
        setPolicies(Array.isArray(policiesRes.data) ? policiesRes.data : [])
      } else {
        setPolicies([])
      }

      if (claimsRes.success && claimsRes.data) {
        setClaims(Array.isArray(claimsRes.data) ? claimsRes.data : [])
      } else {
        setClaims([])
      }
    } catch (e: any) {
      console.error('Error fetching dashboard data:', e)
      setError(e?.message || 'Failed to load data')
      setPolicies([])
      setClaims([])
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const copyPolicyNumber = (policyNumber: string) => {
    navigator.clipboard.writeText(policyNumber)
    toast({
      title: "Copied",
      description: "Policy number copied to clipboard",
    })
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
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getGreeting()}, {userName}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your insurance policies and claims
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/dashboard/holder/policies">
            <Button className="bg-[#07a6ec] hover:bg-[#0696d7]">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Browse Policies
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Policies</p>
                <h3 className="text-2xl font-bold">{policies?.length || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Policies</p>
                <h3 className="text-2xl font-bold">
                  {policies?.filter(p => p.status === 'active').length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <h3 className="text-2xl font-bold">{claims.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Claims</p>
                <h3 className="text-2xl font-bold">
                  {claims?.filter(c => c.status === 'pending').length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy Summary Cards */}
      {policies && policies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <Card key={policy.policy_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{policy.policy_type}</h3>
                      <p className="text-sm text-muted-foreground">{policy.provider_name}</p>
                    </div>
                  </div>
                  {getStatusBadge(policy.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Policy Number</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{policy.policy_number}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPolicyNumber(policy.policy_number)}
                        className="h-4 w-4 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium">₹{policy.coverage_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Premium</span>
                    <span className="font-medium">₹{policy.premium.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium">{new Date(policy.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Link href="/dashboard/user/claims/new">
                    <Button size="sm" className="bg-[#07a6ec] hover:bg-[#0696d7]">
                      <FileText className="h-4 w-4 mr-2" />
                      File Claim
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Policies Found</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any insurance policies yet. Browse available policies to get started.
            </p>
            <Link href="/dashboard/holder/policies">
              <Button className="bg-[#07a6ec] hover:bg-[#0696d7]">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Policies
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="policies">All Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Claims */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {claims && claims.length > 0 ? (
                <div className="space-y-4">
                  {claims.slice(0, 5).map((claim) => (
                    <div key={claim.claim_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {claim.status === "pending" ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : claim.status === "approved" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <h4 className="font-medium">{claim.claim_number}</h4>
                          <p className="text-sm text-muted-foreground">{claim.claim_type}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">₹{claim.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{new Date(claim.incident_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(claim.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Claims Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't filed any claims yet.
                  </p>
                  <Link href="/dashboard/user/claims/new">
                    <Button className="bg-[#07a6ec] hover:bg-[#0696d7]">
                      <Plus className="h-4 w-4 mr-2" />
                      File New Claim
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Claims</CardTitle>
              <Link href="/dashboard/user/claims/new">
                <Button className="bg-[#07a6ec] hover:bg-[#0696d7]">
                  <Plus className="h-4 w-4 mr-2" />
                  New Claim
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {claims && claims.length > 0 ? (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.claim_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium">{claim.claim_number}</h4>
                          <p className="text-sm text-muted-foreground">
                            Policy: {claim.policy_number} • {claim.claim_type}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{claim.description}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">₹{claim.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(claim.incident_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(claim.status)}
                        {claim.processed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Processed: {new Date(claim.processed_at).toLocaleDateString()}
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
                  <p className="text-muted-foreground mb-4">
                    You haven't filed any claims yet.
                  </p>
                  <Link href="/dashboard/user/claims/new">
                    <Button className="bg-[#07a6ec] hover:bg-[#0696d7]">
                      <Plus className="h-4 w-4 mr-2" />
                      File New Claim
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Policies</CardTitle>
            </CardHeader>
            <CardContent>
              {policies && policies.length > 0 ? (
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div key={policy.policy_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{policy.policy_type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {policy.provider_name} • {policy.policy_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">₹{policy.premium.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Coverage: ₹{policy.coverage_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(policy.status)}
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires: {new Date(policy.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Policies Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any insurance policies yet.
                  </p>
                  <Link href="/dashboard/holder/policies">
                    <Button className="bg-[#07a6ec] hover:bg-[#0696d7]">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Browse Policies
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}