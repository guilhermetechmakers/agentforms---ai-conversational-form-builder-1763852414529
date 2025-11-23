import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { webhooksApi } from "@/api/webhooks"
import { toast } from "sonner"
import type { UpdateWebhookInput, WebhookFilters, DeliveryLogFilters } from "@/types/webhook"

export const webhookKeys = {
  all: ["webhooks"] as const,
  lists: () => [...webhookKeys.all, "list"] as const,
  list: (filters?: WebhookFilters) => [...webhookKeys.lists(), { filters }] as const,
  details: () => [...webhookKeys.all, "detail"] as const,
  detail: (id: string) => [...webhookKeys.details(), id] as const,
  deliveryLogs: () => [...webhookKeys.all, "delivery-logs"] as const,
  deliveryLogsList: (filters?: DeliveryLogFilters) => [...webhookKeys.deliveryLogs(), { filters }] as const,
  deliveryLogDetail: (id: string) => [...webhookKeys.deliveryLogs(), "detail", id] as const,
}

export const useWebhooks = (filters?: WebhookFilters) => {
  return useQuery({
    queryKey: webhookKeys.list(filters),
    queryFn: () => webhooksApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export const useWebhook = (id: string) => {
  return useQuery({
    queryKey: webhookKeys.detail(id),
    queryFn: () => webhooksApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateWebhook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: webhooksApi.create,
    onSuccess: (newWebhook) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() })
      queryClient.setQueryData(webhookKeys.detail(newWebhook.id), newWebhook)
      toast.success("Webhook created successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to create webhook: ${error.message}`)
    },
  })
}

export const useUpdateWebhook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateWebhookInput }) =>
      webhooksApi.update(id, updates),
    onSuccess: (updatedWebhook) => {
      queryClient.setQueryData(webhookKeys.detail(updatedWebhook.id), updatedWebhook)
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() })
      toast.success("Webhook updated successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update webhook: ${error.message}`)
    },
  })
}

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: webhooksApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: webhookKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() })
      toast.success("Webhook deleted successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete webhook: ${error.message}`)
    },
  })
}

export const useTestWebhook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: webhooksApi.testDelivery,
    onSuccess: (result, webhookId) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.detail(webhookId) })
      queryClient.invalidateQueries({ queryKey: webhookKeys.deliveryLogs() })
      if (result.success) {
        toast.success("Test delivery successful!")
      } else {
        toast.error(`Test delivery failed: ${result.error || 'Unknown error'}`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to test webhook: ${error.message}`)
    },
  })
}

export const useDeliveryLogs = (filters?: DeliveryLogFilters) => {
  return useQuery({
    queryKey: webhookKeys.deliveryLogsList(filters),
    queryFn: () => webhooksApi.getDeliveryLogs(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes for logs
  })
}

export const useDeliveryLog = (id: string) => {
  return useQuery({
    queryKey: webhookKeys.deliveryLogDetail(id),
    queryFn: () => webhooksApi.getDeliveryLogById(id),
    enabled: !!id,
  })
}
