import { useState, useCallback, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SupportTicketForm } from "@/components/help/SupportTicketForm"
import { useAgents } from "@/hooks/useAgents"
import { helpApi } from "@/api/help"
import { useQuery } from "@tanstack/react-query"
import { Home, Search, HelpCircle, FileText, MessageSquare, ArrowRight, X } from "lucide-react"
import type { Agent } from "@/types/agent"
import type { Documentation } from "@/types/help"

interface SearchResult {
  id: string
  type: "agent" | "documentation"
  title: string
  description?: string
  url: string
}

export default function NotFound() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false)

  // Fetch agents
  const { data: agents = [], isLoading: agentsLoading } = useAgents()

  // Search documentation
  const { data: documentation = [], isLoading: docsLoading } = useQuery({
    queryKey: ["help", "documentation", "search", searchQuery],
    queryFn: () => helpApi.searchDocumentation(searchQuery),
    enabled: searchQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  })

  // Filter and combine search results
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return []

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search agents
    agents.forEach((agent: Agent) => {
      if (
        agent.name.toLowerCase().includes(query) ||
        agent.description?.toLowerCase().includes(query)
      ) {
        results.push({
          id: agent.id,
          type: "agent",
          title: agent.name,
          description: agent.description || undefined,
          url: `/dashboard/agents/${agent.id}`,
        })
      }
    })

    // Search documentation
    documentation.forEach((doc: Documentation) => {
      if (
        doc.title.toLowerCase().includes(query) ||
        doc.content?.toLowerCase().includes(query)
      ) {
        results.push({
          id: doc.id,
          type: "documentation",
          title: doc.title,
          description: doc.content?.substring(0, 150) || undefined,
          url: `/dashboard/help#${doc.id}`,
        })
      }
    })

    return results.slice(0, 8) // Limit to 8 results
  }, [searchQuery, agents, documentation])

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchResults.length > 0) {
        navigate(searchResults[0].url)
      }
    },
    [searchResults, navigate]
  )

  const handleResultClick = useCallback(
    (url: string) => {
      navigate(url)
    },
    [navigate]
  )

  const handleSupportSuccess = useCallback(() => {
    setIsSupportDialogOpen(false)
  }, [])

  const isLoading = agentsLoading || docsLoading

  return (
    <div className="min-h-screen bg-[#22242A] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in-up">
        {/* Error Message Section */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <h1 className="text-8xl md:text-9xl font-bold text-[#F3F4F6] leading-none">
              404
            </h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#F3F4F6]">
            Page Not Found
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's help you find what
            you need.
          </p>
        </div>

        {/* Search Section */}
        <Card className="bg-[#282A30] border-[#303136] shadow-card">
          <CardContent className="p-6">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A1A1AA]" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for agents or documentation..."
                  className="pl-10 pr-10 h-12 text-[#F3F4F6] bg-[#24262C] border-[#303136] focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA]"
                  aria-label="Search for agents or documentation"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[#303136] transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4 text-[#A1A1AA]" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#60A5FA] border-t-transparent" />
                      <p className="mt-2 text-sm text-[#A1A1AA]">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          type="button"
                          onClick={() => handleResultClick(result.url)}
                          className="w-full text-left p-3 rounded-lg bg-[#24262C] border border-[#303136] hover:bg-[#282A30] hover:border-[#60A5FA]/50 transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:ring-offset-2 focus:ring-offset-[#282A30]"
                        >
                          <div className="flex items-start gap-3">
                            {result.type === "agent" ? (
                              <MessageSquare className="h-5 w-5 text-[#60A5FA] mt-0.5 flex-shrink-0" />
                            ) : (
                              <FileText className="h-5 w-5 text-[#4ADE80] mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#F3F4F6] truncate">
                                {result.title}
                              </p>
                              {result.description && (
                                <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-[#A1A1AA] flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-[#A1A1AA]">
                        No results found for "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Link to="/dashboard">
              <Home className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Link to="/">
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <Dialog open={isSupportDialogOpen} onOpenChange={setIsSupportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#282A30]"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Contact Support</DialogTitle>
                <DialogDescription>
                  Need help? Fill out the form below and we'll get back to you as soon as possible.
                </DialogDescription>
              </DialogHeader>
              <SupportTicketForm onSuccess={handleSupportSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
