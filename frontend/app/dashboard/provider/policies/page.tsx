"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  TrendingUp,
  Users,
  DollarSign
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
  holder_name: string
  holder_email: string
  created_at: string
}

export default function PoliciesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("templates")
  const [templates, setTemplates] = useState<PolicyTemplate[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalPolicies: 0,
    totalRevenue: 0,
    activePolicies: 0
  })
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch templates and policies in parallel
      const [templatesRes, policiesRes] = await Promise.all([
        apiClient.get('/policies/provider/templates'),
        apiClient.get('/policies/provider/policies')
      ])

      if (templatesRes.success) {
        setTemplates(templatesRes.data)
        setStats(prev => ({ ...prev, totalTemplates: templatesRes.data.length }))
      }

      if (policiesRes.success) {
        setPolicies(policiesRes.data)
        const activePolicies = policiesRes.data.filter((p: Policy) => p.status === 'active')
        const totalRevenue = policiesRes.data.reduce((sum: number, p: Policy) => sum + p.premium, 0)
        
        setStats(prev => ({
          ...prev,
          totalPolicies: policiesRes.data.length,
          activePolicies: activePolicies.length,
          totalRevenue: totalRevenue
        }))
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

  const filteredTemplates = templates.filter(template =>
    template.policy_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPolicies = policies.filter(policy =>
    policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.policy_type.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Policy Management</h1>
          <p className="text-muted-foreground">
            Manage policy templates and track sold policies
          </p>
        </div>
        <Link href="/dashboard/provider/policies/new">
          <Button className="bg-[#07a6ec] hover:bg-[#0696d7]">
            <Plus className="mr-2 h-4 w-4" />
            New Policy Template
          </Button>
        </Link>
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
                <p className="text-sm text-muted-foreground">Policy Templates</p>
                <h3 className="text-2xl font-bold">{stats.totalTemplates}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Policies Sold</p>
                <h3 className="text-2xl font-bold">{stats.totalPolicies}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Policies</p>
                <h3 className="text-2xl font-bold">{stats.activePolicies}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="templates">Policy Templates</TabsTrigger>
            <TabsTrigger value="policies">Sold Policies</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="templates">
          <div className="space-y-4">
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Policy Templates</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first policy template to start selling insurance policies.
                  </p>
                  <Link href="/dashboard/provider/policies/new">
                    <Button className="bg-[#07a6ec] hover:bg-[#0696d7]">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Template
                    </Button>
                  </Link>
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
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Coverage: ₹{template.coverage_amount.toLocaleString()}</span>
                          <span>Premium: ₹{template.premium.toLocaleString()}</span>
                          <span>Max Claims: {template.max_claims_per_year}/year</span>
                          <span>Expires: {new Date(template.insurance_exp_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="policies">
          <div className="space-y-4">
            {filteredPolicies.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Policies Sold</h3>
                  <p className="text-muted-foreground">
                    No customers have purchased your policies yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPolicies.map((policy) => (
                <Card key={policy.policy_id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{policy.holder_name}</h3>
                          <Badge variant="outline">{policy.policy_number}</Badge>
                          <Badge className={policy.status === 'active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {policy.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {policy.holder_email} • {policy.policy_type}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Coverage: ₹{policy.coverage_amount.toLocaleString()}</span>
                          <span>Premium: ₹{policy.premium.toLocaleString()}</span>
                          <span>Start: {new Date(policy.start_date).toLocaleDateString()}</span>
                          <span>End: {new Date(policy.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
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