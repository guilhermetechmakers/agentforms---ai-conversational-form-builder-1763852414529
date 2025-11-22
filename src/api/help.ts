import { api } from "@/lib/api"
import type {
  Documentation,
  FAQ,
  SamplePrompt,
  SupportTicket,
  SupportTicketInsert,
} from "@/types/help"

export const helpApi = {
  // Documentation
  getDocumentation: async (): Promise<Documentation[]> => {
    return api.get<Documentation[]>("/help/documentation")
  },

  searchDocumentation: async (query: string): Promise<Documentation[]> => {
    return api.get<Documentation[]>(`/help/documentation/search?q=${encodeURIComponent(query)}`)
  },

  getDocumentationByCategory: async (category: string): Promise<Documentation[]> => {
    return api.get<Documentation[]>(`/help/documentation/category/${category}`)
  },

  // FAQs
  getFAQs: async (): Promise<FAQ[]> => {
    return api.get<FAQ[]>("/help/faqs")
  },

  getFAQsByCategory: async (category: string | null): Promise<FAQ[]> => {
    if (!category) {
      return api.get<FAQ[]>("/help/faqs")
    }
    return api.get<FAQ[]>(`/help/faqs/category/${category}`)
  },

  // Sample Prompts
  getSamplePrompts: async (): Promise<SamplePrompt[]> => {
    return api.get<SamplePrompt[]>("/help/sample-prompts")
  },

  getSamplePromptsByCategory: async (category: string): Promise<SamplePrompt[]> => {
    return api.get<SamplePrompt[]>(`/help/sample-prompts/category/${category}`)
  },

  // Support Tickets
  createSupportTicket: async (ticket: SupportTicketInsert): Promise<SupportTicket> => {
    return api.post<SupportTicket>("/help/support-tickets", ticket)
  },

  getMySupportTickets: async (): Promise<SupportTicket[]> => {
    return api.get<SupportTicket[]>("/help/support-tickets")
  },

  getSupportTicket: async (id: string): Promise<SupportTicket> => {
    return api.get<SupportTicket>(`/help/support-tickets/${id}`)
  },
}
