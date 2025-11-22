/**
 * Database types for help-related tables
 * Generated: 2025-11-23T00:09:39Z
 */

export type DocumentationCategory =
  | "getting-started"
  | "agents"
  | "webhooks"
  | "exports"
  | "privacy"
  | "api"
  | "integrations"
  | "other";

export interface Documentation {
  id: string;
  title: string;
  content: string;
  category: DocumentationCategory;
  created_at: string;
  updated_at: string;
}

export interface DocumentationInsert {
  id?: string;
  title: string;
  content: string;
  category: DocumentationCategory;
}

export interface DocumentationUpdate {
  title?: string;
  content?: string;
  category?: DocumentationCategory;
}

export type DocumentationRow = Documentation;

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface FAQInsert {
  id?: string;
  question: string;
  answer: string;
  category?: string | null;
  order_index?: number;
}

export interface FAQUpdate {
  question?: string;
  answer?: string;
  category?: string | null;
  order_index?: number;
}

export type FAQRow = FAQ;

export type SamplePromptCategory =
  | "persona"
  | "field-phrasing"
  | "validation"
  | "welcome-message"
  | "other";

export interface SamplePrompt {
  id: string;
  title: string;
  persona: string | null;
  template: string;
  category: SamplePromptCategory;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SamplePromptInsert {
  id?: string;
  title: string;
  persona?: string | null;
  template: string;
  category: SamplePromptCategory;
  tags?: string[];
}

export interface SamplePromptUpdate {
  title?: string;
  persona?: string | null;
  template?: string;
  category?: SamplePromptCategory;
  tags?: string[];
}

export type SamplePromptRow = SamplePrompt;

export type SupportTicketStatus =
  | "open"
  | "in-progress"
  | "resolved"
  | "closed";

export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
  id: string;
  user_id: string | null;
  email: string;
  subject: string;
  description: string;
  session_id: string | null;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketInsert {
  id?: string;
  user_id?: string | null;
  email: string;
  subject: string;
  description: string;
  session_id?: string | null;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  metadata?: Record<string, any>;
}

export interface SupportTicketUpdate {
  email?: string;
  subject?: string;
  description?: string;
  session_id?: string | null;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  metadata?: Record<string, any>;
}

export type SupportTicketRow = SupportTicket;
