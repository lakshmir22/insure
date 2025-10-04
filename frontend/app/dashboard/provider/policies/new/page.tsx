"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export default function NewPolicyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    policyType: "",
    coverageAmount: "",
    premium: "",
    insuranceExpDate: "",
    maxClaimsPerYear: "",
    description: "",
    termsAndConditions: ""
  })

  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiClient.post('/policies/templates', {
        policyType: formData.policyType,
        coverageAmount: parseFloat(formData.coverageAmount),
        premium: parseFloat(formData.premium),
        insuranceExpDate: formData.insuranceExpDate,
        maxClaimsPerYear: parseInt(formData.maxClaimsPerYear),
        description: formData.description,
        termsAndConditions: formData.termsAndConditions
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Policy template created successfully!",
        })
        router.push("/dashboard/provider/policies")
      } else {
        throw new Error(response.error || 'Failed to create policy template')
      }
    } catch (error: any) {
      console.error("Error creating policy:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create policy template",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/provider/policies">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Policies
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Policy Template</h1>
          <p className="text-muted-foreground">
            Add a new insurance policy template that customers can purchase
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Policy Template Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="policyType">Policy Type</Label>
                <Select value={formData.policyType} onValueChange={(value) => handleInputChange("policyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Health">Health Insurance</SelectItem>
                    <SelectItem value="Vehicle">Vehicle Insurance</SelectItem>
                    <SelectItem value="Life">Life Insurance</SelectItem>
                    <SelectItem value="Travel">Travel Insurance</SelectItem>
                    <SelectItem value="Property">Property Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverageAmount">Coverage Amount (₹)</Label>
                <Input
                  id="coverageAmount"
                  type="number"
                  placeholder="Enter coverage amount"
                  value={formData.coverageAmount}
                  onChange={(e) => handleInputChange("coverageAmount", e.target.value)}
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="premium">Premium (₹)</Label>
                <Input
                  id="premium"
                  type="number"
                  placeholder="Enter premium amount"
                  value={formData.premium}
                  onChange={(e) => handleInputChange("premium", e.target.value)}
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceExpDate">Insurance Expiry Date</Label>
                <Input
                  id="insuranceExpDate"
                  type="date"
                  value={formData.insuranceExpDate}
                  onChange={(e) => handleInputChange("insuranceExpDate", e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxClaimsPerYear">Max Claims Per Year</Label>
                <Input
                  id="maxClaimsPerYear"
                  type="number"
                  placeholder="Enter max claims per year"
                  value={formData.maxClaimsPerYear}
                  onChange={(e) => handleInputChange("maxClaimsPerYear", e.target.value)}
                  required
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter policy description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <Textarea
                id="termsAndConditions"
                placeholder="Enter terms and conditions"
                value={formData.termsAndConditions}
                onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/provider/policies">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-[#07a6ec] hover:bg-[#0696d7]">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Policy Template
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}