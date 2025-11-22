export interface Agent {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  schema: AgentSchema;
  persona?: Persona;
  knowledge?: KnowledgeBase;
  visuals?: VisualSettings;
  status: 'draft' | 'published';
  public_url?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AgentSchema {
  fields: Field[];
}

export interface Field {
  id: string;
  key: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRules;
  options?: string[]; // For select/multi-select
  help_text?: string;
  order: number;
}

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'date' 
  | 'select' 
  | 'multi-select' 
  | 'attachment';

export interface ValidationRules {
  regex?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

export interface Persona {
  name?: string;
  tone?: string;
  instructions?: string;
  welcome_message?: string;
}

export interface KnowledgeBase {
  type: 'text' | 'file';
  content?: string;
  file_url?: string;
  embeddings_enabled?: boolean;
}

export interface VisualSettings {
  primary_color?: string;
  avatar_url?: string;
  logo_url?: string;
  welcome_message?: string;
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  schema: AgentSchema;
  persona?: Persona;
  knowledge?: KnowledgeBase;
  visuals?: VisualSettings;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  schema?: AgentSchema;
  persona?: Persona;
  knowledge?: KnowledgeBase;
  visuals?: VisualSettings;
}
