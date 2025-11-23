/**
 * Database types for visitors and engagements tables
 * Generated: 2025-11-23T01:00:07Z
 */

export interface Visitor {
  id: string;
  session_id: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  interaction_history: InteractionEvent[];
  arrival_time: string;
  last_interaction: string;
  created_at: string;
  updated_at: string;
}

export interface InteractionEvent {
  type: string;
  timestamp: string;
  section?: string;
  metadata?: Record<string, any>;
}

export interface VisitorInsert {
  id?: string;
  session_id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  interaction_history?: InteractionEvent[];
}

export interface VisitorUpdate {
  interaction_history?: InteractionEvent[];
  last_interaction?: string;
}

export type CTAType = 'signup' | 'demo' | 'pricing' | 'feature' | 'testimonial' | 'footer_link' | 'contact';

export interface Engagement {
  id: string;
  visitor_id: string;
  cta_type: CTAType;
  engagement_type: 'click' | 'view' | 'hover' | 'scroll';
  target_element: string | null;
  target_url: string | null;
  section: string | null;
  metadata: Record<string, any>;
  engagement_time: string;
  created_at: string;
}

export interface EngagementInsert {
  id?: string;
  visitor_id: string;
  cta_type: CTAType;
  engagement_type: 'click' | 'view' | 'hover' | 'scroll';
  target_element?: string | null;
  target_url?: string | null;
  section?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result types
export type VisitorRow = Visitor;
export type EngagementRow = Engagement;
