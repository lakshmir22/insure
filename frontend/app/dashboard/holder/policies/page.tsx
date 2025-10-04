"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  Shield,
  Search,
  RefreshCw,
  ShoppingCart,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface PolicyTemplate {
  template_id: number
  policy_type: string
  coverage_amount: number
  premium: number
  insurance_exp_date: string
  max_claims_per_year: number
  description: string
  terms_and_conditions: string
  is_active: boolean
  created_at: string
  provider_name: string
  provider_email: string
  blockchain_template_id: number
}

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
  blockchain_policy_id: number
}

export default function HolderPoliciesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("purchase")
  const [templates, setTemplates] = useState<PolicyTemplate[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch templates and user policies in parallel
      const [templatesRes, policiesRes] = await Promise.all([
        apiClient.get('/policies/templates'),
        apiClient.get('/policies/user/policies')
      ])

      if (templatesRes.success) {
        setTemplates(templatesRes.data)
      }

      if (policiesRes.success) {
        setPolicies(policiesRes.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch policy data",
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

  const filteredTemplates = templates.filter(template =>
    template.policy_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPolicies = policies.filter(policy =>
    policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.policy_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading policy data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Insurance Policies</h1>
          <p className="text-muted-foreground">
            Purchase new policies and manage your existing ones
          </p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Policies</p>
                <h3 className="text-2xl font-bold">{policies.length}</h3>
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
                  {policies.filter(p => p.status === 'active').length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Policies</p>
                <h3 className="text-2xl font-bold">{templates.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="purchase">Purchase Policy</TabsTrigger>
            <TabsTrigger value="my-policies">My Policies</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search policies..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="purchase">
          <div className="space-y-4">
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Policies Available</h3>
                  <p className="text-muted-foreground">
                    No insurance policies are currently available for purchase.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTemplates.map((template) => (
                <Card key={template.template_id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{template.policy_type} Insurance</h3>
                          <Badge variant="outline">Template #{template.template_id}</Badge>
                          <Badge className={template.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {template.is_active ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Coverage: ₹{template.coverage_amount.toLocaleString()}</span>
                          <span>Premium: ₹{template.premium.toLocaleString()}</span>
                          <span>Max Claims: {template.max_claims_per_year}/year</span>
                          <span>Expires: {new Date(template.insurance_exp_date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Provider: {template.provider_name} ({template.provider_email})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Show terms and conditions in a modal or new tab
                            window.open(`/policies/template/${template.template_id}/terms`, '_blank')
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Terms
                        </Button>
                        <Link href={`/dashboard/holder/policies/purchase?templateId=${template.template_id}`}>
                          <Button 
                            size="sm"
                            className="bg-[#07a6ec] hover:bg-[#0696d7]"
                            disabled={!template.is_active}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Purchase Policy
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-policies">
          <div className="space-y-4">
            {filteredPolicies.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Policies Purchased</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't purchased any insurance policies yet.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("purchase")}
                    className="bg-[#07a6ec] hover:bg-[#0696d7]"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Browse Policies
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredPolicies.map((policy) => (
                <Card key={policy.policy_id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{policy.policy_type} Insurance</h3>
                          <Badge variant="outline">{policy.policy_number}</Badge>
                          <Badge className={
                            policy.status === 'active' 
                              ? "bg-green-100 text-green-800" 
                              : policy.status === 'expired'
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }>
                            {policy.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {policy.status === 'expired' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {policy.status === 'cancelled' && <Clock className="h-3 w-3 mr-1" />}
                            {policy.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Provider: {policy.provider_name} ({policy.provider_email})
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Coverage: ₹{policy.coverage_amount.toLocaleString()}</span>
                          <span>Premium: ₹{policy.premium.toLocaleString()}</span>
                          <span>Start: {new Date(policy.start_date).toLocaleDateString()}</span>
                          <span>End: {new Date(policy.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Purchased: {new Date(policy.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyPolicyNumber(policy.policy_number)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Policy #
                        </Button>
                        <Link href={`/dashboard/holder/policies/${policy.policy_id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
