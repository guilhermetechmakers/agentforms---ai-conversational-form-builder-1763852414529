import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SearchBar } from "@/components/help/SearchBar"
import { SupportTicketForm } from "@/components/help/SupportTicketForm"
import {
  useDocumentation,
  useSearchDocumentation,
  useFAQs,
  useSamplePrompts,
} from "@/hooks/useHelp"
import {
  BookOpen,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  ExternalLink,
  FileText,
  Code,
  Link as LinkIcon,
  Github,
  FileCode,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const DOCUMENTATION_CATEGORIES = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "agents", label: "Agents", icon: MessageSquare },
  { id: "webhooks", label: "Webhooks", icon: LinkIcon },
  { id: "exports", label: "Exports", icon: FileText },
  { id: "privacy", label: "Privacy", icon: FileCode },
  { id: "api", label: "API", icon: Code },
] as const

const SAMPLE_PROMPT_CATEGORIES = [
  { id: "persona", label: "Personas", icon: Sparkles },
  { id: "field-phrasing", label: "Field Phrasing", icon: MessageSquare },
  { id: "welcome-message", label: "Welcome Messages", icon: BookOpen },
] as const

export default function AboutHelp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocCategory, setSelectedDocCategory] = useState<string | null>(null)
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string | null>(null)

  // Data fetching
  const { data: allDocs, isLoading: docsLoading } = useDocumentation()
  const { data: searchResults, isLoading: searchLoading } = useSearchDocumentation(searchQuery)
  const { data: faqs, isLoading: faqsLoading } = useFAQs()
  const { data: samplePrompts, isLoading: promptsLoading } = useSamplePrompts(
    selectedPromptCategory || undefined
  )

  // Filter documentation based on search or category
  const displayedDocs = useMemo(() => {
    if (searchQuery) {
      return searchResults || []
    }
    if (selectedDocCategory && allDocs) {
      return allDocs.filter((doc) => doc.category === selectedDocCategory)
    }
    return allDocs || []
  }, [searchQuery, searchResults, selectedDocCategory, allDocs])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedDocCategory(null)
  }

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedDocCategory(categoryId)
    setSearchQuery("")
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-[#F3F4F6]">About & Help</h1>
        <p className="text-[#A1A1AA] text-lg">
          Find answers, explore documentation, and get support for AgentForms
        </p>
      </div>

      {/* Searchable Documentation Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[#F6D365]" />
          <h2 className="text-2xl font-semibold text-[#F3F4F6]">Documentation</h2>
        </div>

        <SearchBar
          onSearch={handleSearch}
          placeholder="Search documentation..."
          className="max-w-2xl"
        />

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedDocCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategorySelect(null)}
            className={cn(
              selectedDocCategory === null
                ? "bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                : "border-[#303136] text-[#A1A1AA] hover:text-[#F3F4F6]"
            )}
          >
            All
          </Button>
          {DOCUMENTATION_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedDocCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(category.id)}
              className={cn(
                selectedDocCategory === category.id
                  ? "bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                  : "border-[#303136] text-[#A1A1AA] hover:text-[#F3F4F6]"
              )}
            >
              <category.icon className="mr-2 h-4 w-4" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* Documentation Results */}
        {docsLoading || searchLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-[#282A30] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#282A30] rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-[#282A30] rounded w-full mb-2" />
                  <div className="h-3 bg-[#282A30] rounded w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayedDocs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedDocs.map((doc) => (
              <Card
                key={doc.id}
                className="hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-[#F6D365] transition-colors">
                      {doc.title}
                    </CardTitle>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#282A30] text-[#A1A1AA] capitalize">
                      {doc.category.replace("-", " ")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#A1A1AA] line-clamp-3">
                    {doc.content.substring(0, 150)}...
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">
                {searchQuery
                  ? `No documentation found for "${searchQuery}"`
                  : "No documentation available yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* FAQ Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-[#60A5FA]" />
          <h2 className="text-2xl font-semibold text-[#F3F4F6]">Frequently Asked Questions</h2>
        </div>

        {faqsLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-[#282A30] rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : faqs && faqs.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                    <AccordionTrigger className="px-6 py-4 text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="prose prose-invert max-w-none">
                        <p className="text-[#A1A1AA] whitespace-pre-line">{faq.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">No FAQs available yet</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Sample Prompt Library Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-[#4ADE80]" />
          <h2 className="text-2xl font-semibold text-[#F3F4F6]">Sample Prompt Library</h2>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPromptCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPromptCategory(null)}
            className={cn(
              selectedPromptCategory === null
                ? "bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                : "border-[#303136] text-[#A1A1AA] hover:text-[#F3F4F6]"
            )}
          >
            All
          </Button>
          {SAMPLE_PROMPT_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedPromptCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPromptCategory(category.id)}
              className={cn(
                selectedPromptCategory === category.id
                  ? "bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                  : "border-[#303136] text-[#A1A1AA] hover:text-[#F3F4F6]"
              )}
            >
              <category.icon className="mr-2 h-4 w-4" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* Sample Prompts */}
        {promptsLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-[#282A30] rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-[#282A30] rounded w-full mb-2" />
                  <div className="h-3 bg-[#282A30] rounded w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : samplePrompts && samplePrompts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {samplePrompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="hover:scale-[1.02] transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#282A30] text-[#A1A1AA] capitalize">
                      {prompt.category.replace("-", " ")}
                    </span>
                  </div>
                  {prompt.persona && (
                    <CardDescription className="text-[#A1A1AA] italic">
                      Persona: {prompt.persona}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-[#A1A1AA] whitespace-pre-line line-clamp-4">
                      {prompt.template}
                    </p>
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {prompt.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-[#24262C] text-[#A1A1AA]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">No sample prompts available yet</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Support Contact Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[#F472B6]" />
          <h2 className="text-2xl font-semibold text-[#F3F4F6]">Contact Support</h2>
        </div>
        <SupportTicketForm />
      </section>

      {/* Community Links Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-6 w-6 text-[#60A5FA]" />
          <h2 className="text-2xl font-semibold text-[#F3F4F6]">Community & Resources</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:scale-[1.02] transition-all duration-200 cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5 text-[#A1A1AA] group-hover:text-[#F6D365] transition-colors" />
                <CardTitle className="text-lg">GitHub</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#A1A1AA]">
                View source code, report issues, and contribute to the project
              </CardDescription>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-[#60A5FA] hover:text-[#60A5FA]/80"
                asChild
              >
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  Visit GitHub <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:scale-[1.02] transition-all duration-200 cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#A1A1AA] group-hover:text-[#F6D365] transition-colors" />
                <CardTitle className="text-lg">Changelog</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#A1A1AA]">
                Stay updated with the latest features and improvements
              </CardDescription>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-[#60A5FA] hover:text-[#60A5FA]/80"
                asChild
              >
                <a href="/changelog" target="_blank" rel="noopener noreferrer">
                  View Changelog <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:scale-[1.02] transition-all duration-200 cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-[#A1A1AA] group-hover:text-[#F6D365] transition-colors" />
                <CardTitle className="text-lg">Roadmap</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#A1A1AA]">
                See what's coming next and vote on upcoming features
              </CardDescription>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-[#60A5FA] hover:text-[#60A5FA]/80"
                asChild
              >
                <a href="/roadmap" target="_blank" rel="noopener noreferrer">
                  View Roadmap <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
