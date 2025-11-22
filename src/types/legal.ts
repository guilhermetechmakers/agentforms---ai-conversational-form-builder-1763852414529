/**
 * Database types for legal documents and legal requests tables
 * Generated: 2025-11-23T00:14:04Z
 */

export type LegalDocumentType = 'privacy-policy' | 'terms-of-service' | 'cookie-policy';

export type LegalRequestType = 'data-deletion' | 'data-export' | 'privacy-inquiry' | 'other';

export type LegalRequestStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';

export interface LegalDocument {
  id: string;
  document_type: LegalDocumentType;
  content: string;
  version_number: number;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LegalDocumentInsert {
  id?: string;
  document_type: LegalDocumentType;
  content: string;
  version_number?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface LegalDocumentUpdate {
  content?: string;
  version_number?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface LegalRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  request_type: LegalRequestType;
  message: string;
  status: LegalRequestStatus;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LegalRequestInsert {
  id?: string;
  user_id?: string | null;
  name: string;
  email: string;
  request_type: LegalRequestType;
  message: string;
  status?: LegalRequestStatus;
  metadata?: Record<string, any>;
}

export interface LegalRequestUpdate {
  name?: string;
  email?: string;
  request_type?: LegalRequestType;
  message?: string;
  status?: LegalRequestStatus;
  metadata?: Record<string, any>;
}

// Supabase query result types
export type LegalDocumentRow = LegalDocument;
export type LegalRequestRow = LegalRequest;
