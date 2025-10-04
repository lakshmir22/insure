"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"

// Dummy smart contract data
const smartContractData = {
  contractAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  transactions: [
    {
      id: "TX123",
      type: "Claim Verification",
      status: "Completed",
      timestamp: "2024-03-20 14:30:00",
      details: "Health claim verified via Aadhaar",
      hash: "0x8a24...",
    },
    {
      id: "TX124",
      type: "Policy Update",
      status: "Pending",
      timestamp: "2024-03-20 14:35:00",
      details: "Premium payment verification",
      hash: "0x9b35...",
    },
    // Add more transactions...
  ],
  metrics: {
    totalClaims: 156,
    successfulPayouts: 142,
    averageProcessingTime: "4.2 minutes",
    fraudPrevented: 14,
  }
}

export function SmartContractViewer() {
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)
  const [newPolicy, setNewPolicy] = useState({
    policyholder: "",
    coverageAmount: "",
    startDate: "",
    endDate: "",
    policyType: "HEALTH",
  })

  const createPolicy = async () => {
    setCreating(true)
    setCreateMsg(null)
    try {
      const res = await apiClient.post("/insurance/policy", {
        ...newPolicy,
        terms: {
          maxCoveragePerClaim: newPolicy.coverageAmount,
          copayPercentage: 10,
          waitingPeriod: 0,
          maxClaimsPerYear: 3,
          preExistingConditionsCovered: false,
          maxHospitalizationDays: 30,
          maxRoomRent: 0,
          maxICUCharges: 0,
          maxOperationCharges: 0,
          maxMedicineCharges: 0,
          maxDiagnosticCharges: 0,
          maxAmbulanceCharges: 0,
          maxPreHospitalizationDays: 0,
          maxPostHospitalizationDays: 0,
        }
      })
      setCreateMsg(`Policy created. Number: ${res.policyNumber || 'N/A'}`)
    } catch (e: any) {
      setCreateMsg(e?.message || 'Failed to create policy')
    } finally {
      setCreating(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Shield className="h-6 w-6 text-[#07a6ec]" />
        <div>
          <h3 className="text-lg font-semibold">Smart Contract Status</h3>
          <p className="text-sm text-muted-foreground">
            Contract: {smartContractData.contractAddress.slice(0, 6)}...
            {smartContractData.contractAddress.slice(-4)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(smartContractData.metrics).map(([key, value]) => (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-lg font-semibold">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Create Policy (Insurer)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="Policyholder address" value={newPolicy.policyholder} onChange={(e) => setNewPolicy(p => ({...p, policyholder: e.target.value}))} />
            <Input placeholder="Coverage (ETH)" value={newPolicy.coverageAmount} onChange={(e) => setNewPolicy(p => ({...p, coverageAmount: e.target.value}))} />
            <Input placeholder="Start Date (YYYY-MM-DD)" value={newPolicy.startDate} onChange={(e) => setNewPolicy(p => ({...p, startDate: e.target.value}))} />
            <Input placeholder="End Date (YYYY-MM-DD)" value={newPolicy.endDate} onChange={(e) => setNewPolicy(p => ({...p, endDate: e.target.value}))} />
            <Input placeholder="Policy Type (HEALTH/TRAVEL)" value={newPolicy.policyType} onChange={(e) => setNewPolicy(p => ({...p, policyType: e.target.value}))} />
          </div>
          <Button onClick={createPolicy} disabled={creating}>{creating ? 'Creating...' : 'Create Policy'}</Button>
          {createMsg && <p className="text-sm text-muted-foreground">{createMsg}</p>}
        </div>
        <h4 className="font-medium">Recent Transactions</h4>
        {smartContractData.transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              {tx.status === "Completed" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">{tx.type}</p>
                <p className="text-sm text-muted-foreground">{tx.details}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={tx.status === "Completed" ? "default" : "outline"}>
                {tx.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{tx.hash}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 