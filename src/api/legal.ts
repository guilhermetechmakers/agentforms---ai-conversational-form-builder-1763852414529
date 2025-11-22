import { api } from "@/lib/api";
import type {
  LegalDocument,
  LegalDocumentType,
  LegalRequest,
  LegalRequestInsert,
} from "@/types/legal";

/**
 * Get active legal document by type
 */
export async function getLegalDocument(
  documentType: LegalDocumentType
): Promise<LegalDocument | null> {
  try {
    const response = await api.get<{ data: LegalDocument | null }>(
      `/legal/documents/${documentType}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching legal document:", error);
    return null;
  }
}

/**
 * Get all legal documents (for admin)
 */
export async function getAllLegalDocuments(): Promise<LegalDocument[]> {
  try {
    const response = await api.get<{ data: LegalDocument[] }>(
      "/legal/documents"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching legal documents:", error);
    return [];
  }
}

/**
 * Submit a legal request
 */
export async function submitLegalRequest(
  data: LegalRequestInsert
): Promise<LegalRequest> {
  const response = await api.post<{ data: LegalRequest }>(
    "/legal/requests",
    data
  );
  return response.data;
}
