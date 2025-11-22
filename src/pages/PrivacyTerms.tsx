import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LegalRequestForm } from "@/components/legal/LegalRequestForm";
import { useLegalDocument } from "@/hooks/useLegal";
import {
  Shield,
  FileText,
  Cookie,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Default content if API doesn't return documents
const DEFAULT_PRIVACY_POLICY = `# Privacy Policy

**Last Updated: November 23, 2024**

## 1. Introduction

AgentForms ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI conversational form builder service.

## 2. Information We Collect

### 2.1 Information You Provide
- Account information (name, email, password)
- Agent configurations and form schemas
- Session data and conversation transcripts
- Payment and billing information

### 2.2 Automatically Collected Information
- Usage data and analytics
- Device information and IP addresses
- Cookies and similar tracking technologies

## 3. How We Use Your Information

We use the information we collect to:
- Provide and maintain our services
- Process transactions and send related information
- Send administrative information and updates
- Respond to your inquiries and provide support
- Improve our services and develop new features
- Detect, prevent, and address technical issues

## 4. Data Sharing and Disclosure

We do not sell your personal information. We may share your information:
- With service providers who assist in operating our platform
- When required by law or to protect our rights
- In connection with a business transfer or merger
- With your consent or at your direction

## 5. Data Retention

We retain your information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your data at any time.

## 6. Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Object to processing of your data
- Request data portability
- Withdraw consent where applicable

## 7. Security

We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.

## 8. International Data Transfers

Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place.

## 9. Children's Privacy

Our services are not intended for children under 13. We do not knowingly collect information from children.

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.

## 11. Contact Us

If you have questions about this Privacy Policy, please contact us using the form below.`;

const DEFAULT_TERMS_OF_SERVICE = `# Terms of Service

**Last Updated: November 23, 2024**

## 1. Acceptance of Terms

By accessing or using AgentForms, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.

## 2. Description of Service

AgentForms is an AI-powered conversational form builder that allows users to create, configure, and share interactive agents that collect structured data through natural conversations.

## 3. User Accounts

### 3.1 Account Creation
- You must provide accurate and complete information
- You are responsible for maintaining account security
- You must be at least 18 years old or have parental consent

### 3.2 Account Responsibilities
- You are responsible for all activities under your account
- You must notify us immediately of any unauthorized use
- You may not share your account credentials

## 4. Acceptable Use

You agree not to:
- Use the service for any illegal purpose
- Violate any laws or regulations
- Infringe on intellectual property rights
- Transmit harmful code or malware
- Interfere with service operations
- Collect data without proper consent
- Use the service to spam or harass others

## 5. Content and Intellectual Property

### 5.1 Your Content
- You retain ownership of content you create
- You grant us a license to use your content to provide the service
- You are responsible for ensuring you have rights to use any content

### 5.2 Our Content
- All service features and technology are our property
- You may not copy, modify, or distribute our proprietary materials
- Our trademarks and logos are protected

## 6. Payment and Billing

### 6.1 Subscription Plans
- Subscription fees are billed in advance
- Plans auto-renew unless cancelled
- Refunds are subject to our refund policy

### 6.2 Payment Processing
- Payments are processed by third-party providers
- You are responsible for providing accurate payment information
- We reserve the right to change pricing with notice

## 7. Service Availability

- We strive for high availability but do not guarantee uninterrupted service
- We may perform maintenance that temporarily affects availability
- We are not liable for service interruptions

## 8. Limitation of Liability

To the maximum extent permitted by law:
- We provide the service "as is" without warranties
- We are not liable for indirect, incidental, or consequential damages
- Our total liability is limited to the amount you paid in the past 12 months

## 9. Indemnification

You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the service or violation of these terms.

## 10. Termination

### 10.1 By You
- You may cancel your account at any time
- Cancellation takes effect at the end of your billing period

### 10.2 By Us
- We may suspend or terminate accounts that violate these terms
- We may discontinue the service with reasonable notice

## 11. Changes to Terms

We may modify these terms at any time. Continued use after changes constitutes acceptance.

## 12. Governing Law

These terms are governed by the laws of the jurisdiction in which we operate, without regard to conflict of law principles.

## 13. Contact Information

For questions about these terms, please contact us using the form below.`;

const DEFAULT_COOKIE_POLICY = `# Cookie Policy

**Last Updated: November 23, 2024**

## 1. What Are Cookies

Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience.

## 2. How We Use Cookies

We use cookies to:
- Remember your login status and preferences
- Analyze how you use our service
- Provide personalized content and features
- Improve security and prevent fraud

## 3. Types of Cookies We Use

### 3.1 Essential Cookies
These cookies are necessary for the service to function. They include:
- Authentication cookies
- Session management cookies
- Security cookies

### 3.2 Analytics Cookies
We use analytics cookies to understand how visitors interact with our service:
- Page views and navigation patterns
- Feature usage statistics
- Performance metrics

### 3.3 Functional Cookies
These cookies enable enhanced functionality:
- Language preferences
- Display settings
- User interface preferences

## 4. Third-Party Cookies

We may use third-party services that set their own cookies:
- Analytics providers (e.g., Google Analytics)
- Payment processors
- Customer support tools

## 5. Managing Cookies

You can control cookies through:
- Your browser settings
- Our cookie preferences panel (if available)
- Third-party opt-out tools

Note: Disabling cookies may affect service functionality.

## 6. Cookie Retention

- Session cookies expire when you close your browser
- Persistent cookies remain until they expire or are deleted
- Expiration times vary by cookie type

## 7. Updates to This Policy

We may update this Cookie Policy to reflect changes in our practices or for legal reasons.

## 8. Contact Us

For questions about our use of cookies, please contact us using the form below.`;

export default function PrivacyTerms() {
  const [activeSection, setActiveSection] = useState<string>("privacy");

  // Fetch legal documents from API (with fallback to defaults)
  const { data: privacyDoc } = useLegalDocument("privacy-policy");
  const { data: termsDoc } = useLegalDocument("terms-of-service");
  const { data: cookieDoc } = useLegalDocument("cookie-policy");

  const privacyContent = privacyDoc?.content || DEFAULT_PRIVACY_POLICY;
  const termsContent = termsDoc?.content || DEFAULT_TERMS_OF_SERVICE;
  const cookieContent = cookieDoc?.content || DEFAULT_COOKIE_POLICY;

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#22242A] text-[#F3F4F6]">
      {/* Header */}
      <header className="border-b border-[#303136] bg-[#282A30] sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-[#A1A1AA] hover:text-[#F3F4F6]"
              >
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-[#F3F4F6]">
                Privacy & Terms
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Table of Contents Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#F6D365]" />
              Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeSection === "privacy" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveSection("privacy");
                  scrollToSection("privacy-policy");
                }}
                className={cn(
                  activeSection === "privacy"
                    ? "bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                    : "border-[#303136] text-[#A1A1AA] hover:text-[#F3F4F6]"
                )}
              >
                <Shield className="mr-2 h-4 w-4" />
                Privacy Policy
              </Button>
              <Button
                variant={activeSection === "terms" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveSection("terms");
                  scrollToSection("terms-of-service");
                }}
                className={cn(
                  activeSection === "terms"
                    ? "bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                    : "border-[#303136] text-[#A1A1AA] hover:text-[#F3F4F6]"
                )}
              >
                <FileText className="mr-2 h-4 w-4" />
                Terms of Service
              </Button>
              <Button
                variant={activeSection === "cookies" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveSection("cookies");
                  scrollToSection("cookie-policy");
                }}
                className={cn(
                  activeSection === "cookies"
                    ? "bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                    : "border-[#303136] text-[#A1A1AA] hover:text-[#F3F4F6]"
                )}
              >
                <Cookie className="mr-2 h-4 w-4" />
                Cookie Policy
              </Button>
              <Button
                variant={activeSection === "contact" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveSection("contact");
                  scrollToSection("legal-requests");
                }}
                className={cn(
                  activeSection === "contact"
                    ? "bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                    : "border-[#303136] text-[#A1A1AA] hover:text-[#F3F4F6]"
                )}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Section */}
        <section
          id="privacy-policy"
          className={cn(
            "mb-12 animate-fade-in-up",
            activeSection !== "privacy" && "hidden md:block"
          )}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-[#F6D365]" />
                <CardTitle>Privacy Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-invert max-w-none prose-headings:text-[#F3F4F6] prose-p:text-[#A1A1AA] prose-strong:text-[#F3F4F6] prose-a:text-[#60A5FA] prose-a:no-underline hover:prose-a:underline prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-li:text-[#A1A1AA] prose-ul:text-[#A1A1AA] prose-ol:text-[#A1A1AA] whitespace-pre-wrap"
              >
                {privacyContent.split("\n").map((line, idx) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={idx} className="text-3xl font-bold mt-8 mb-4">
                        {line.substring(2)}
                      </h1>
                    );
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={idx} className="text-2xl font-semibold mt-6 mb-3">
                        {line.substring(3)}
                      </h2>
                    );
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={idx} className="text-xl font-semibold mt-4 mb-2">
                        {line.substring(4)}
                      </h3>
                    );
                  }
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p key={idx} className="font-semibold my-2">
                        {line.slice(2, -2)}
                      </p>
                    );
                  }
                  if (line.trim() === "") {
                    return <br key={idx} />;
                  }
                  return (
                    <p key={idx} className="my-2">
                      {line}
                    </p>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Terms of Service Section */}
        <section
          id="terms-of-service"
          className={cn(
            "mb-12 animate-fade-in-up",
            activeSection !== "terms" && "hidden md:block"
          )}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-[#60A5FA]" />
                <CardTitle>Terms of Service</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-invert max-w-none prose-headings:text-[#F3F4F6] prose-p:text-[#A1A1AA] prose-strong:text-[#F3F4F6] prose-a:text-[#60A5FA] prose-a:no-underline hover:prose-a:underline prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-li:text-[#A1A1AA] prose-ul:text-[#A1A1AA] prose-ol:text-[#A1A1AA] whitespace-pre-wrap"
              >
                {termsContent.split("\n").map((line, idx) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={idx} className="text-3xl font-bold mt-8 mb-4">
                        {line.substring(2)}
                      </h1>
                    );
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={idx} className="text-2xl font-semibold mt-6 mb-3">
                        {line.substring(3)}
                      </h2>
                    );
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={idx} className="text-xl font-semibold mt-4 mb-2">
                        {line.substring(4)}
                      </h3>
                    );
                  }
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p key={idx} className="font-semibold my-2">
                        {line.slice(2, -2)}
                      </p>
                    );
                  }
                  if (line.trim() === "") {
                    return <br key={idx} />;
                  }
                  return (
                    <p key={idx} className="my-2">
                      {line}
                    </p>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cookie Policy Section */}
        <section
          id="cookie-policy"
          className={cn(
            "mb-12 animate-fade-in-up",
            activeSection !== "cookies" && "hidden md:block"
          )}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cookie className="h-6 w-6 text-[#4ADE80]" />
                <CardTitle>Cookie Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-invert max-w-none prose-headings:text-[#F3F4F6] prose-p:text-[#A1A1AA] prose-strong:text-[#F3F4F6] prose-a:text-[#60A5FA] prose-a:no-underline hover:prose-a:underline prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-li:text-[#A1A1AA] prose-ul:text-[#A1A1AA] prose-ol:text-[#A1A1AA] whitespace-pre-wrap"
              >
                {cookieContent.split("\n").map((line, idx) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={idx} className="text-3xl font-bold mt-8 mb-4">
                        {line.substring(2)}
                      </h1>
                    );
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={idx} className="text-2xl font-semibold mt-6 mb-3">
                        {line.substring(3)}
                      </h2>
                    );
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={idx} className="text-xl font-semibold mt-4 mb-2">
                        {line.substring(4)}
                      </h3>
                    );
                  }
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p key={idx} className="font-semibold my-2">
                        {line.slice(2, -2)}
                      </p>
                    );
                  }
                  if (line.trim() === "") {
                    return <br key={idx} />;
                  }
                  return (
                    <p key={idx} className="my-2">
                      {line}
                    </p>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Legal Requests Section */}
        <section
          id="legal-requests"
          className={cn(
            "mb-12 animate-fade-in-up",
            activeSection !== "contact" && "hidden md:block"
          )}
        >
          <LegalRequestForm />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#303136] py-8 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#A1A1AA] text-sm">
              © 2024 AgentForms. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                to="/"
                className="text-[#A1A1AA] hover:text-[#F3F4F6] text-sm transition-colors"
              >
                Home
              </Link>
              <Link
                to="/help"
                className="text-[#A1A1AA] hover:text-[#F3F4F6] text-sm transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
