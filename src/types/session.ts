export interface Session {
  id: string;
  agent_id: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  visitor_metadata?: VisitorMetadata;
  started_at: string;
  completed_at?: string;
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
  field_key?: string; // If message collected a field value
  created_at: string;
}

export interface FieldValue {
  id: string;
  session_id: string;
  field_key: string;
  value: string | number | string[];
  validated: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionWithData extends Session {
  messages: Message[];
  field_values: FieldValue[];
  agent?: {
    id: string;
    name: string;
  };
}
