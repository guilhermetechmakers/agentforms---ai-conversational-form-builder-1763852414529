import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  Globe,
  Lock,
  TrendingUp,
  Star,
  Menu,
  X,
} from "lucide-react"
import { LiveDemoModal } from "@/components/landing/LiveDemoModal"
import { ContactForm } from "@/components/landing/ContactForm"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useVisitorTracking } from "@/hooks/useVisitorTracking"

export default function Landing() {
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const { trackEngagement } = useVisitorTracking()
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 }
    )

    const sections = document.querySelectorAll("[data-section]")
    sections.forEach((section) => {
      if (section.id) {
        observerRef.current?.observe(section)
      }
    })

    return () => {
      sections.forEach((section) => {
        observerRef.current?.unobserve(section)
      })
    }
  }, [])

  const handleCTAClick = (type: 'signup' | 'demo' | 'pricing' | 'footer_link' | 'contact', section?: string) => {
    trackEngagement({
      cta_type: type,
      engagement_type: 'click',
      section: section || 'hero',
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="h-6 w-6 text-yellow" />
              <span className="bg-gradient-to-r from-yellow to-blue bg-clip-text text-transparent">
                AgentForms
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick('footer_link', 'header')}
              >
                Features
              </Link>
              <Link
                to="#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick('footer_link', 'header')}
              >
                How It Works
              </Link>
              <Link
                to="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick('footer_link', 'header')}
              >
                Pricing
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  setContactModalOpen(true)
                  handleCTAClick('contact', 'header')
                }}
              >
                Contact
              </Button>
              <Button asChild variant="outline">
                <Link to="/login" onClick={() => handleCTAClick('signup', 'header')}>
                  Sign In
                </Link>
              </Button>
              <Button asChild className="bg-yellow text-background hover:bg-yellow/90">
                <Link to="/signup" onClick={() => handleCTAClick('signup', 'header')}>
                  Get Started
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-border pt-4">
              <Link
                to="#features"
                className="block py-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleCTAClick('footer_link', 'header')
                }}
              >
                Features
              </Link>
              <Link
                to="#how-it-works"
                className="block py-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleCTAClick('footer_link', 'header')
                }}
              >
                How It Works
              </Link>
              <Link
                to="#pricing"
                className="block py-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleCTAClick('footer_link', 'header')
                }}
              >
                Pricing
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setContactModalOpen(true)
                  setMobileMenuOpen(false)
                  handleCTAClick('contact', 'header')
                }}
              >
                Contact
              </Button>
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/login" onClick={() => handleCTAClick('signup', 'header')}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="flex-1 bg-yellow text-background hover:bg-yellow/90">
                  <Link to="/signup" onClick={() => handleCTAClick('signup', 'header')}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        data-section="hero"
        className="relative overflow-hidden py-24 md:py-32"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow/10 via-blue/10 to-pink/10 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(246,211,101,0.1),transparent_50%)]" />

        <div className="container mx-auto px-6 relative z-10">
          <div
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              visibleSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow via-blue to-pink bg-clip-text text-transparent animate-gradient">
              Build AI-Powered Conversational Forms
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Create intelligent agents that collect structured data through natural conversations.
              Share links, gather insights, and automate your workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-yellow text-background hover:bg-yellow/90 text-lg px-8 py-6 h-auto"
                onClick={() => handleCTAClick('signup', 'hero')}
              >
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto"
                onClick={() => {
                  setDemoModalOpen(true)
                  handleCTAClick('demo', 'hero')
                }}
              >
                <Play className="mr-2 h-5 w-5" />
                View Demo Agent
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section
        id="features"
        data-section="features"
        className="py-24 bg-card"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything you need to collect data intelligently
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to make data collection effortless and engaging
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: MessageSquare,
                  title: "AI-Powered Conversations",
                  description: "LLM-driven agents that adapt questions based on responses and context, creating natural, engaging interactions.",
                  color: "text-yellow",
                },
                {
                  icon: Zap,
                  title: "Instant Setup",
                  description: "Create and publish agents in minutes with our intuitive builder. No coding required.",
                  color: "text-blue",
                },
                {
                  icon: Shield,
                  title: "Secure & Private",
                  description: "Enterprise-grade security with data encryption, compliance, and privacy controls.",
                  color: "text-green",
                },
                {
                  icon: BarChart3,
                  title: "Analytics & Insights",
                  description: "Track sessions, conversion rates, and export data seamlessly with detailed analytics.",
                  color: "text-pink",
                },
                {
                  icon: Globe,
                  title: "Shareable Links",
                  description: "Generate unique public URLs for each agent. Share anywhere, embed anywhere.",
                  color: "text-blue",
                },
                {
                  icon: Lock,
                  title: "Data Control",
                  description: "Full control over your data with export, webhook integration, and retention policies.",
                  color: "text-green",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className={`card-hover transition-all duration-700 ${
                    visibleSections.has('features')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <feature.icon className={`h-10 w-10 ${feature.color} mb-4`} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Embed Section */}
      <section
        id="demo"
        data-section="demo"
        className="py-24 bg-background"
      >
        <div className="container mx-auto px-6">
          <div
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              visibleSections.has('demo') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <Card className="bg-gradient-to-br from-card to-card-secondary border-2 border-yellow/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-yellow/20 flex items-center justify-center">
                  <Play className="h-8 w-8 text-yellow" />
                </div>
                <CardTitle className="text-3xl mb-2">Try It Live</CardTitle>
                <CardDescription className="text-lg">
                  Experience how AI-powered conversational forms work in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  See how our AI agent intelligently collects structured data through natural conversation.
                  No signup required to try the demo.
                </p>
                <Button
                  size="lg"
                  className="bg-yellow text-background hover:bg-yellow/90 text-lg px-8"
                  onClick={() => {
                    setDemoModalOpen(true)
                    handleCTAClick('demo', 'demo')
                  }}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Launch Live Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        data-section="how-it-works"
        className="py-24 bg-card"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                visibleSections.has('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Create Your Agent",
                  description: "Design your agent's schema, persona, and visual branding using our intuitive builder.",
                  icon: Sparkles,
                },
                {
                  step: "2",
                  title: "Publish & Share",
                  description: "Generate a unique public URL and share it anywhere. Your agent is ready to collect data.",
                  icon: Globe,
                },
                {
                  step: "3",
                  title: "Collect & Analyze",
                  description: "View sessions, export data, and integrate with webhooks. All responses are structured and searchable.",
                  icon: TrendingUp,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`text-center transition-all duration-700 ${
                    visibleSections.has('how-it-works')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="relative mb-6">
                    <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow to-blue flex items-center justify-center text-2xl font-bold text-background">
                      {item.step}
                    </div>
                    <item.icon className="absolute -top-2 -right-2 h-8 w-8 text-yellow" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section
        id="pricing"
        data-section="pricing"
        className="py-24 bg-background"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                visibleSections.has('pricing') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Starter",
                  price: "Free",
                  description: "Perfect for trying out AgentForms",
                  features: ["3 agents", "100 sessions/month", "Basic analytics", "Email support"],
                  highlight: false,
                },
                {
                  name: "Professional",
                  price: "$29",
                  period: "/month",
                  description: "For growing teams",
                  features: ["Unlimited agents", "10,000 sessions/month", "Advanced analytics", "Webhook integration", "Priority support"],
                  highlight: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  description: "For large organizations",
                  features: ["Everything in Pro", "Unlimited sessions", "Custom integrations", "Dedicated support", "SLA guarantee"],
                  highlight: false,
                },
              ].map((plan, index) => (
                <Card
                  key={index}
                  className={`card-hover transition-all duration-700 ${
                    plan.highlight ? 'border-2 border-yellow scale-105' : ''
                  } ${
                    visibleSections.has('pricing')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    {plan.highlight && (
                      <div className="absolute top-0 right-0 bg-yellow text-background px-3 py-1 rounded-bl-xl text-sm font-semibold">
                        Popular
                      </div>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`w-full ${plan.highlight ? 'bg-yellow text-background hover:bg-yellow/90' : ''}`}
                      variant={plan.highlight ? 'default' : 'outline'}
                      onClick={() => handleCTAClick('pricing', 'pricing')}
                    >
                      <Link to="/checkout">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Logos & Testimonials Section */}
      <section
        id="testimonials"
        data-section="testimonials"
        className="py-24 bg-card"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Teams Worldwide</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what our customers are saying
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  name: "Sarah Chen",
                  role: "Product Manager",
                  company: "TechCorp",
                  content: "AgentForms transformed how we collect user feedback. The AI conversations feel natural and we get structured data automatically.",
                  rating: 5,
                },
                {
                  name: "Michael Rodriguez",
                  role: "Marketing Director",
                  company: "GrowthCo",
                  content: "We've seen a 3x increase in form completion rates. The conversational approach is a game-changer for lead generation.",
                  rating: 5,
                },
                {
                  name: "Emily Watson",
                  role: "Founder",
                  company: "StartupXYZ",
                  content: "Setting up our first agent took less than 10 minutes. The analytics and export features are exactly what we needed.",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className={`card-hover transition-all duration-700 ${
                    visibleSections.has('testimonials')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow text-yellow" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow to-blue flex items-center justify-center text-background font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Customer Logos */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["TechCorp", "GrowthCo", "StartupXYZ", "InnovateLab", "DataFlow"].map((company, index) => (
                <div
                  key={index}
                  className="text-2xl font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-yellow/10 via-blue/10 to-pink/10">
        <div className="container mx-auto px-6">
          <Card className="max-w-4xl mx-auto text-center bg-card border-2 border-yellow/20">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl mb-4">Ready to get started?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of teams using AgentForms to collect data intelligently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-yellow text-background hover:bg-yellow/90 text-lg px-8"
                  onClick={() => handleCTAClick('signup', 'cta')}
                >
                  <Link to="/signup">
                    Start Building Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  onClick={() => {
                    setContactModalOpen(true)
                    handleCTAClick('contact', 'cta')
                  }}
                >
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-yellow" />
                <span className="text-xl font-bold">AgentForms</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered conversational forms that collect structured data through natural conversations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="#features"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick('footer_link', 'footer')}
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="#pricing"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick('footer_link', 'footer')}
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick('footer_link', 'footer')}
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => {
                      setContactModalOpen(true)
                      handleCTAClick('contact', 'footer')
                    }}
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick('footer_link', 'footer')}
                  >
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick('footer_link', 'footer')}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleCTAClick('footer_link', 'footer')}
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 AgentForms. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick('footer_link', 'footer')}
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick('footer_link', 'footer')}
              >
                Terms
              </Link>
              <Link
                to="/help"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleCTAClick('footer_link', 'footer')}
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LiveDemoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />

      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>
              Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <ContactForm onSuccess={() => setContactModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
