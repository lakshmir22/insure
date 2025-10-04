"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import apiClient from "@/lib/api-client"

export function FileClaimForm() {
  const [date, setDate] = useState<Date>()
  const [policyNumber, setPolicyNumber] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submitClaim = async () => {
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        policyNumber: policyNumber.trim(),
        claimAmount: Number(amount),
        incidentDescription: description,
        billStartDate: date ? date.toISOString() : undefined,
      }
      const res = await apiClient.post("/claims/claim", payload)
      setMessage(`Claim submitted. ID: ${res?.claimId || res?.claim?.claimId || 'N/A'}`)
      setPolicyNumber("")
      setDescription("")
      setAmount("")
      setDate(undefined)
    } catch (e: any) {
      setMessage(e?.message || "Failed to submit claim")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="file-claim-form">
      <h3 className="text-lg font-semibold mb-4">File a New Claim</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="policyNumber">Policy Number</Label>
          <Input id="policyNumber" placeholder="Enter your policy number" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incidentDate">Date of Incident</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Claim Amount</Label>
          <Input id="amount" type="number" placeholder="Enter claim amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Incident Description</Label>
          <textarea
            id="description"
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
            placeholder="Describe what happened..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={submitClaim} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Claim'}
          </Button>
          {message && (
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    </Card>
  )
} 