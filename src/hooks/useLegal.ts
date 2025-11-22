import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getLegalDocument,
  getAllLegalDocuments,
  submitLegalRequest,
} from "@/api/legal";
import type {
  LegalDocumentType,
  LegalRequestInsert,
} from "@/types/legal";

/**
 * Query key factory for legal documents
 */
export const legalKeys = {
  all: ["legal"] as const,
  documents: () => [...legalKeys.all, "documents"] as const,
  document: (type: LegalDocumentType) =>
    [...legalKeys.documents(), type] as const,
  requests: () => [...legalKeys.all, "requests"] as const,
};

/**
 * Get active legal document by type
 */
export function useLegalDocument(type: LegalDocumentType) {
  return useQuery({
    queryKey: legalKeys.document(type),
    queryFn: () => getLegalDocument(type),
    staleTime: 1000 * 60 * 60, // 1 hour - legal documents don't change often
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Get all legal documents (admin only)
 */
export function useAllLegalDocuments() {
  return useQuery({
    queryKey: legalKeys.documents(),
    queryFn: getAllLegalDocuments,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Submit a legal request
 */
export function useSubmitLegalRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LegalRequestInsert) => submitLegalRequest(data),
    onSuccess: () => {
      toast.success("Legal request submitted successfully", {
        description: "We'll review your request and get back to you soon.",
      });
      queryClient.invalidateQueries({ queryKey: legalKeys.requests() });
    },
    onError: (error: Error) => {
      toast.error("Failed to submit legal request", {
        description: error.message || "Please try again later.",
      });
    },
  });
}
