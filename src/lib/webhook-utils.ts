/**
 * Webhook utilities for HMAC signature generation and webhook forwarding
 * These functions handle secure webhook delivery with retry logic
 */

import type { Webhook, RetryPolicy, DeliveryLog } from "@/types/webhook"

/**
 * Generate HMAC SHA-256 signature for webhook payload
 * @param payload - The JSON payload to sign
 * @param secret - The HMAC secret key
 * @returns Base64-encoded HMAC signature
 */
export async function generateHMACSignature(
  payload: string,
  secret: string
): Promise<string> {
  // Use Web Crypto API for HMAC generation (browser-compatible)
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const payloadData = encoder.encode(payload)

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, payloadData)
  const hashArray = Array.from(new Uint8Array(signature))
  const hashBase64 = btoa(String.fromCharCode(...hashArray))

  return hashBase64
}

/**
 * Calculate exponential backoff delay
 * @param attemptNumber - Current attempt number (1-indexed)
 * @param initialDelayMs - Initial delay in milliseconds
 * @returns Delay in milliseconds
 */
export function calculateExponentialBackoff(
  attemptNumber: number,
  initialDelayMs: number
): number {
  return initialDelayMs * Math.pow(2, attemptNumber - 1)
}

/**
 * Calculate linear backoff delay
 * @param attemptNumber - Current attempt number (1-indexed)
 * @param initialDelayMs - Initial delay in milliseconds
 * @returns Delay in milliseconds
 */
export function calculateLinearBackoff(
  attemptNumber: number,
  initialDelayMs: number
): number {
  return initialDelayMs * attemptNumber
}

/**
 * Calculate next retry delay based on retry policy
 * @param attemptNumber - Current attempt number (1-indexed)
 * @param retryPolicy - Retry policy configuration
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(
  attemptNumber: number,
  retryPolicy: RetryPolicy
): number {
  if (retryPolicy.backoff_type === "exponential") {
    return calculateExponentialBackoff(attemptNumber, retryPolicy.initial_delay_ms)
  } else {
    return calculateLinearBackoff(attemptNumber, retryPolicy.initial_delay_ms)
  }
}

/**
 * Prepare webhook headers with authentication
 * @param webhook - Webhook configuration
 * @param payload - JSON payload string
 * @returns Headers object with authentication
 */
export async function prepareWebhookHeaders(
  webhook: Webhook,
  payload: string
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...webhook.headers,
  }

  // Add authentication headers
  switch (webhook.auth_type) {
    case "bearer":
      if (webhook.auth_token) {
        headers.Authorization = `Bearer ${webhook.auth_token}`
      }
      break

    case "basic":
      if (webhook.auth_token) {
        headers.Authorization = `Basic ${webhook.auth_token}`
      }
      break

    case "hmac":
      if (webhook.auth_token) {
        const signature = await generateHMACSignature(payload, webhook.auth_token)
        headers["X-Webhook-Signature"] = signature
        headers["X-Webhook-Signature-Algorithm"] = "sha256"
      }
      break

    case "none":
    default:
      // No authentication
      break
  }

  return headers
}

/**
 * Forward webhook payload to endpoint with retry logic
 * This function should be called server-side for production use
 * @param webhook - Webhook configuration
 * @param payload - Payload to send
 * @param attemptNumber - Current attempt number (default: 1)
 * @param logDelivery - Function to log delivery attempts
 * @returns Delivery result
 */
export async function forwardWebhook(
  webhook: Webhook,
  payload: Record<string, any>,
  attemptNumber: number = 1,
  logDelivery?: (log: Omit<DeliveryLog, "id" | "created_at"> & { session_id?: string | null }) => Promise<DeliveryLog>
): Promise<{
  success: boolean
  response_code?: number
  response_body?: string
  error?: string
  duration_ms?: number
}> {
  const startedAt = new Date()
  const payloadString = JSON.stringify(payload)
  let response: Response | null = null
  let responseBody: string = ""
  let error: Error | null = null

  try {
    // Prepare headers with authentication
    const headers = await prepareWebhookHeaders(webhook, payloadString)

    // Make HTTP request
    response = await fetch(webhook.url, {
      method: webhook.method,
      headers,
      body: payloadString,
    })

    responseBody = await response.text()
    const completedAt = new Date()
    const durationMs = completedAt.getTime() - startedAt.getTime()

    const success = response.ok

    // Log delivery attempt
    if (logDelivery) {
      await logDelivery({
        webhook_id: webhook.id,
        attempt_number: attemptNumber,
        status: success ? "success" : "failed",
        response_code: response.status,
        response_body: responseBody.substring(0, 10000), // Limit response body size
        response_headers: Object.fromEntries(response.headers.entries()),
        request_payload: payload,
        request_headers: headers,
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        duration_ms: durationMs,
        will_retry: !success && attemptNumber < webhook.retry_policy.max_retries,
        next_retry_at:
          !success && attemptNumber < webhook.retry_policy.max_retries
            ? new Date(
                Date.now() + calculateRetryDelay(attemptNumber, webhook.retry_policy)
              ).toISOString()
            : undefined,
      })
    }

    return {
      success,
      response_code: response.status,
      response_body: responseBody,
      duration_ms: durationMs,
    }
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err))
    const completedAt = new Date()
    const durationMs = completedAt.getTime() - startedAt.getTime()

    // Log failed delivery
    if (logDelivery) {
      await logDelivery({
        webhook_id: webhook.id,
        attempt_number: attemptNumber,
        status: "failed",
        error_message: error.message,
        error_type: "network_error",
        request_payload: payload,
        request_headers: {},
        response_headers: {},
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        duration_ms: durationMs,
        will_retry: attemptNumber < webhook.retry_policy.max_retries,
        next_retry_at:
          attemptNumber < webhook.retry_policy.max_retries
            ? new Date(
                Date.now() + calculateRetryDelay(attemptNumber, webhook.retry_policy)
              ).toISOString()
            : undefined,
      })
    }

    return {
      success: false,
      error: error.message,
      duration_ms: durationMs,
    }
  }
}

/**
 * Retry webhook delivery with exponential/linear backoff
 * @param webhook - Webhook configuration
 * @param payload - Payload to send
 * @param logDelivery - Function to log delivery attempts
 * @returns Final delivery result
 */
export async function retryWebhookDelivery(
  webhook: Webhook,
  payload: Record<string, any>,
  logDelivery?: (log: Omit<DeliveryLog, "id" | "created_at"> & { session_id?: string | null }) => Promise<DeliveryLog>
): Promise<{
  success: boolean
  response_code?: number
  response_body?: string
  error?: string
  attempts: number
}> {
  const maxAttempts = webhook.retry_policy.max_retries + 1 // +1 for initial attempt
  let lastResult: Awaited<ReturnType<typeof forwardWebhook>> | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Wait before retry (except for first attempt)
    if (attempt > 1) {
      const delay = calculateRetryDelay(attempt - 1, webhook.retry_policy)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    lastResult = await forwardWebhook(webhook, payload, attempt, logDelivery)

    // If successful, return immediately
    if (lastResult.success) {
      return {
        ...lastResult,
        attempts: attempt,
      }
    }

    // If this was the last attempt, return failure
    if (attempt === maxAttempts) {
      return {
        ...lastResult,
        attempts: attempt,
      }
    }
  }

  // Fallback (should never reach here)
  return {
    success: false,
    error: "Max retries exceeded",
    attempts: maxAttempts,
  }
}

/**
 * Build webhook payload for session events
 * @param eventType - Type of event (session_started, session_completed, etc.)
 * @param sessionData - Session data
 * @param agentData - Agent data (optional)
 * @returns Webhook payload
 */
export function buildWebhookPayload(
  eventType: string,
  sessionData: Record<string, any>,
  agentData?: Record<string, any>
): Record<string, any> {
  return {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: {
      session: sessionData,
      ...(agentData && { agent: agentData }),
    },
  }
}
