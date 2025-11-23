import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  Lock,
  FileText,
  Database,
  Key,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { EncryptionSettingsSection } from "@/components/security/EncryptionSettingsSection"
import { AuditLogsSection } from "@/components/settings/AuditLogsSection"
import { DataRetentionSection } from "@/components/settings/DataRetentionSection"
import { SSOConfigurationSection } from "@/components/security/SSOConfigurationSection"
import { useEncryptionSettings } from "@/hooks/useSettings"
import { Badge } from "@/components/ui/badge"

export default function SecurityCompliance() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: encryptionSettings } = useEncryptionSettings()
  
  // Get initial tab from URL or default to encryption
  const initialTab = searchParams.get("tab") || "encryption"
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchParams({ tab: value })
  }

  // Calculate overall security status
  const getOverallStatus = () => {
    if (!encryptionSettings) return "warning"
    
    const issues: string[] = []
    
    if (!encryptionSettings.encryption_at_rest_enabled) {
      issues.push("encryption_at_rest")
    }
    if (!encryptionSettings.tls_enabled) {
      issues.push("tls")
    }
    if (encryptionSettings.tls_min_version === "TLSv1.0" || encryptionSettings.tls_min_version === "TLSv1.1") {
      issues.push("tls_version")
    }
    
    if (issues.length === 0) return "compliant"
    if (issues.length <= 2) return "warning"
    return "non-compliant"
  }

  const overallStatus = getOverallStatus()
  const statusColors = {
    compliant: "bg-[#4ADE80]",
    warning: "bg-[#FBBF24]",
    "non-compliant": "bg-[#F87171]",
  }
  const statusIcons = {
    compliant: CheckCircle2,
    warning: AlertTriangle,
    "non-compliant": AlertTriangle,
  }
  const StatusIcon = statusIcons[overallStatus]

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Security & Compliance</h1>
          <p className="text-[#A1A1AA] mt-1">
            Manage encryption, audit logs, data retention, and SSO configuration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-5 w-5 ${overallStatus === "compliant" ? "text-[#4ADE80]" : overallStatus === "warning" ? "text-[#FBBF24]" : "text-[#F87171]"}`} />
          <Badge className={`${statusColors[overallStatus]} text-white capitalize`}>
            {overallStatus.replace("-", " ")}
          </Badge>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#24262C] border-[#303136]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#60A5FA]/10">
                <Lock className="h-5 w-5 text-[#60A5FA]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Encryption at Rest</p>
                <p className="text-lg font-semibold text-[#F3F4F6]">
                  {encryptionSettings?.encryption_at_rest_enabled ? (
                    <span className="text-[#4ADE80]">Enabled</span>
                  ) : (
                    <span className="text-[#F87171]">Disabled</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#24262C] border-[#303136]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#60A5FA]/10">
                <Shield className="h-5 w-5 text-[#60A5FA]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">TLS Encryption</p>
                <p className="text-lg font-semibold text-[#F3F4F6]">
                  {encryptionSettings?.tls_enabled ? (
                    <span className="text-[#4ADE80]">Enabled</span>
                  ) : (
                    <span className="text-[#F87171]">Disabled</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#24262C] border-[#303136]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#60A5FA]/10">
                <Database className="h-5 w-5 text-[#60A5FA]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Data Retention</p>
                <p className="text-lg font-semibold text-[#F3F4F6]">Configured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#24262C] border-[#303136]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#60A5FA]/10">
                <FileText className="h-5 w-5 text-[#60A5FA]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Audit Logging</p>
                <p className="text-lg font-semibold text-[#F3F4F6]">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 bg-[#24262C] border border-[#303136]">
          <TabsTrigger value="encryption" className="gap-2 data-[state=active]:bg-[#F6D365] data-[state=active]:text-[#22242A]">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Encryption</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2 data-[state=active]:bg-[#F6D365] data-[state=active]:text-[#22242A]">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Audit Logs</span>
          </TabsTrigger>
          <TabsTrigger value="retention" className="gap-2 data-[state=active]:bg-[#F6D365] data-[state=active]:text-[#22242A]">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data Retention</span>
          </TabsTrigger>
          <TabsTrigger value="sso" className="gap-2 data-[state=active]:bg-[#F6D365] data-[state=active]:text-[#22242A]">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">SSO</span>
          </TabsTrigger>
        </TabsList>

        {/* Encryption Tab */}
        <TabsContent value="encryption" className="mt-6">
          <EncryptionSettingsSection />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="mt-6">
          <AuditLogsSection />
        </TabsContent>

        {/* Data Retention Tab */}
        <TabsContent value="retention" className="mt-6">
          <DataRetentionSection />
        </TabsContent>

        {/* SSO Configuration Tab */}
        <TabsContent value="sso" className="mt-6">
          <SSOConfigurationSection />
        </TabsContent>
      </Tabs>

      {/* Compliance Footer */}
      <Card className="bg-[#24262C] border-[#303136]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Compliance & Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-[#303136] bg-[#282A30]">
              <h4 className="font-semibold text-[#F3F4F6] mb-2">GDPR</h4>
              <p className="text-sm text-[#A1A1AA]">
                General Data Protection Regulation compliance features enabled
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[#303136] bg-[#282A30]">
              <h4 className="font-semibold text-[#F3F4F6] mb-2">CCPA</h4>
              <p className="text-sm text-[#A1A1AA]">
                California Consumer Privacy Act compliance features available
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[#303136] bg-[#282A30]">
              <h4 className="font-semibold text-[#F3F4F6] mb-2">SOC 2</h4>
              <p className="text-sm text-[#A1A1AA]">
                Security controls aligned with SOC 2 Type II standards
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#303136]">
            <p className="text-sm text-[#A1A1AA]">
              For detailed compliance documentation and audit reports, please contact support or visit our{" "}
              <a href="/privacy" className="text-[#60A5FA] hover:underline">
                Privacy Policy
              </a>
              {" "}and{" "}
              <a href="/terms" className="text-[#60A5FA] hover:underline">
                Terms of Service
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
