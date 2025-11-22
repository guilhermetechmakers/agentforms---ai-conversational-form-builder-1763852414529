import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { helpApi } from "@/api/help"
import { toast } from "sonner"

export const helpKeys = {
  all: ["help"] as const,
  documentation: () => [...helpKeys.all, "documentation"] as const,
  documentationSearch: (query: string) => [...helpKeys.documentation(), "search", query] as const,
  documentationCategory: (category: string) => [...helpKeys.documentation(), "category", category] as const,
  faqs: () => [...helpKeys.all, "faqs"] as const,
  faqsCategory: (category: string | null) => [...helpKeys.faqs(), "category", category] as const,
  samplePrompts: () => [...helpKeys.all, "sample-prompts"] as const,
  samplePromptsCategory: (category: string) => [...helpKeys.samplePrompts(), "category", category] as const,
  supportTickets: () => [...helpKeys.all, "support-tickets"] as const,
  supportTicket: (id: string) => [...helpKeys.supportTickets(), id] as const,
}

export const useDocumentation = () => {
  return useQuery({
    queryKey: helpKeys.documentation(),
    queryFn: helpApi.getDocumentation,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useSearchDocumentation = (query: string) => {
  return useQuery({
    queryKey: helpKeys.documentationSearch(query),
    queryFn: () => helpApi.searchDocumentation(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useDocumentationByCategory = (category: string) => {
  return useQuery({
    queryKey: helpKeys.documentationCategory(category),
    queryFn: () => helpApi.getDocumentationByCategory(category),
    enabled: !!category,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useFAQs = (category?: string | null) => {
  return useQuery({
    queryKey: helpKeys.faqsCategory(category || null),
    queryFn: () => helpApi.getFAQsByCategory(category || null),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useSamplePrompts = (category?: string) => {
  return useQuery({
    queryKey: category
      ? helpKeys.samplePromptsCategory(category)
      : helpKeys.samplePrompts(),
    queryFn: () =>
      category
        ? helpApi.getSamplePromptsByCategory(category)
        : helpApi.getSamplePrompts(),
    enabled: !category || !!category,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useMySupportTickets = () => {
  return useQuery({
    queryKey: helpKeys.supportTickets(),
    queryFn: helpApi.getMySupportTickets,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useSupportTicket = (id: string) => {
  return useQuery({
    queryKey: helpKeys.supportTicket(id),
    queryFn: () => helpApi.getSupportTicket(id),
    enabled: !!id,
  })
}

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: helpApi.createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpKeys.supportTickets() })
      toast.success("Support ticket submitted successfully! We'll get back to you soon.")
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit support ticket: ${error.message}`)
    },
  })
}
