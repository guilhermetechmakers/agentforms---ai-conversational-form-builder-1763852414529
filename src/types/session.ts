export interface Session {
  id: string;
  agent_id: string;
  visitor_id: string | null;
  status: 'in-progress' | 'completed' | 'abandoned';
  visitor_metadata?: VisitorMetadata;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitorMetadata {
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  consent_given?: boolean;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'agent' | 'visitor';
  content: string;
  field_key?: string | null; // If message collected a field value
  attachment_url?: string | null;
  attachment_type?: string | null;
  created_at: string;
}

export interface FieldValue {
  id: string;
  session_id: string;
  field_key: string;
  value: string | number | string[] | Record<string, unknown>; // JSONB can be any JSON
  validated: boolean;
  validation_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionWithData extends Session {
  messages: Message[];
  field_values: FieldValue[];
  agent?: {
    id: string;
    name: string;
    visuals?: {
      avatar_url?: string;
      logo_url?: string;
      welcome_message?: string;
      primary_color?: string;
    };
    persona?: {
      welcome_message?: string;
    };
  };
}

// Public chat specific types
export interface CreateSessionRequest {
  agent_id: string;
  visitor_id?: string;
  consent_given: boolean;
  visitor_metadata?: VisitorMetadata;
}

export interface CreateSessionResponse {
  session: Session;
  visitor_id: string;
  agent: {
    id: string;
    name: string;
    visuals?: {
      avatar_url?: string;
      logo_url?: string;
      welcome_message?: string;
      primary_color?: string;
    };
    persona?: {
      welcome_message?: string;
    };
  };
}

export interface SendMessageRequest {
  session_id: string;
  content: string;
  field_key?: string;
  attachment_url?: string;
  attachment_type?: string;
}

export interface SendMessageResponse {
  message: Message;
  session: Session;
  field_value?: FieldValue;
}

export interface SessionAuditTrail {
  id: string;
  session_id: string;
  user_id: string | null;
  action: 'exported' | 'redacted_pii' | 'webhook_resent' | 'marked_reviewed' | 'field_updated' | 'session_deleted' | 'viewed';
  action_details: Record<string, unknown>;
  description: string | null;
  created_at: string;
}
