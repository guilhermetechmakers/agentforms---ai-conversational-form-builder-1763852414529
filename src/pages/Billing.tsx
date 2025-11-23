import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, BarChart3, FileText, Wallet } from "lucide-react"
import { BillingOverview } from "@/components/billing/BillingOverview"
import { BillingUsage } from "@/components/billing/BillingUsage"
import { BillingInvoices } from "@/components/billing/BillingInvoices"
import { BillingPaymentMethods } from "@/components/billing/BillingPaymentMethods"

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get("tab") || "overview"
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchParams({ tab: value })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Billing & Subscription</h1>
          <p className="text-[#A1A1AA] mt-1">
            Manage your subscription, view usage, and handle invoices
          </p>
        </div>
      </div>

      {/* Billing Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 bg-[#282A30]">
          <TabsTrigger
            value="overview"
            className="gap-2 data-[state=active]:bg-[#F6D365] data-[state=active]:text-[#22242A]"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            className="gap-2 data-[state=active]:bg-[#F6D365] data-[state=active]:text-[#22242A]"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Usage</span>
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="gap-2 data-[state=active]:bg-[#F6D365] data-[state=active]:text-[#22242A]"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Invoices</span>
          </TabsTrigger>
          <TabsTrigger
            value="payment-methods"
            className="gap-2 data-[state=active]:bg-[#F6D365] data-[state=active]:text-[#22242A]"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Payment Methods</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <BillingOverview />
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="mt-6">
          <BillingUsage />
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6">
          <BillingInvoices />
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="mt-6">
          <BillingPaymentMethods />
        </TabsContent>
      </Tabs>
    </div>
  )
}
