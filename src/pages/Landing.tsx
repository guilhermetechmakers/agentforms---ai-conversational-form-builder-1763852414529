import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { MessageSquare, Zap, Shield, BarChart3, ArrowRight } from "lucide-react"

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#22242A] text-[#F3F4F6]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#F6D365] to-[#60A5FA] bg-clip-text text-transparent">
              Build AI-Powered Conversational Forms
            </h1>
            <p className="text-xl text-[#A1A1AA] mb-8 max-w-2xl mx-auto">
              Create intelligent agents that collect structured data through natural conversations. 
              Share links, gather insights, and automate your workflows.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#282A30]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything you need to collect data intelligently
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: MessageSquare,
                  title: "AI-Powered Conversations",
                  description: "LLM-driven agents that adapt questions based on responses and context.",
                },
                {
                  icon: Zap,
                  title: "Instant Setup",
                  description: "Create and publish agents in minutes with our intuitive builder.",
                },
                {
                  icon: Shield,
                  title: "Secure & Private",
                  description: "Enterprise-grade security with data encryption and compliance.",
                },
                {
                  icon: BarChart3,
                  title: "Analytics & Insights",
                  description: "Track sessions, conversion rates, and export data seamlessly.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-[#24262C] border border-[#303136] hover:scale-[1.02] transition-all duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <feature.icon className="h-8 w-8 text-[#F6D365] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[#A1A1AA]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center bg-[#282A30] rounded-2xl p-12 border border-[#303136]">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-[#A1A1AA] mb-8">
              Join thousands of teams using AgentForms to collect data intelligently.
            </p>
            <Button asChild size="lg" className="bg-[#F6D365] text-[#22242A]">
              <Link to="/signup">Start Building Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#303136] py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#A1A1AA] text-sm">
              © 2024 AgentForms. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                to="/privacy"
                className="text-[#A1A1AA] hover:text-[#F3F4F6] text-sm transition-colors"
              >
                Privacy & Terms
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
  )
}
