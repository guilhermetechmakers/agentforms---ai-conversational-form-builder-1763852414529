/**
 * LLM Orchestration Service Layer
 * Handles prompt construction, LLM queries, caching, and logging
 */

import type {
  PromptConstructionInput,
  LLMQueryOptions,
  LLMQueryResult,
  LLMProvider,
  CreateResponseInput,
  CreateUsageLogInput,
} from "@/types/llm-orchestration"
import { llmOrchestrationApi } from "@/api/llm-orchestration"

// =====================================================
// PROMPT CONSTRUCTION
// =====================================================

/**
 * Constructs a prompt from persona, knowledge, and schema data
 */
export function constructPrompt(input: PromptConstructionInput): string {
  const { persona, knowledge, schema, conversationHistory = [], remainingFields = [] } = input

  let prompt = ""

  // Persona section
  if (persona.name || persona.tone || persona.instructions) {
    prompt += "# Persona\n\n"
    if (persona.name) {
      prompt += `You are ${persona.name}.\n\n`
    }
    if (persona.tone) {
      prompt += `Tone: ${persona.tone}\n\n`
    }
    if (persona.instructions) {
      prompt += `Instructions: ${persona.instructions}\n\n`
    }
  }

  // Knowledge base section
  if (knowledge.content || knowledge.file_url) {
    prompt += "# Knowledge Base\n\n"
    if (knowledge.content) {
      prompt += `${knowledge.content}\n\n`
    }
    if (knowledge.file_url) {
      prompt += `[Knowledge base file available at: ${knowledge.file_url}]\n\n`
    }
  }

  // Schema section
  if (schema.fields && schema.fields.length > 0) {
    prompt += "# Field Schema\n\n"
    prompt += "You need to collect the following information:\n\n"

    const fieldsToCollect = remainingFields.length > 0
      ? schema.fields.filter(f => remainingFields.includes(f.key))
      : schema.fields

    fieldsToCollect.forEach((field) => {
      prompt += `- ${field.label} (${field.type})`
      if (field.required) {
        prompt += " [REQUIRED]"
      }
      if (field.help_text) {
        prompt += ` - ${field.help_text}`
      }
      if (field.options && field.options.length > 0) {
        prompt += ` - Options: ${field.options.join(", ")}`
      }
      prompt += "\n"
    })
    prompt += "\n"
  }

  // Conversation history
  if (conversationHistory.length > 0) {
    prompt += "# Conversation History\n\n"
    conversationHistory.forEach((msg) => {
      prompt += `${msg.role === 'agent' ? 'Agent' : 'Visitor'}: ${msg.content}\n`
    })
    prompt += "\n"
  }

  // Instructions
  prompt += "# Instructions\n\n"
  prompt += "Based on the conversation history, ask the next question to collect the required information. "
  prompt += "Be conversational, friendly, and guide the visitor through the form. "
  prompt += "If the visitor's response is unclear or invalid, politely ask for clarification. "
  prompt += "Once all required fields are collected, thank the visitor and confirm completion.\n"

  return prompt.trim()
}

/**
 * Redacts PII from prompt text
 */
export function redactPII(text: string): string {
  // Email pattern
  text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL_REDACTED]")
  
  // Phone pattern (various formats)
  text = text.replace(/\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[PHONE_REDACTED]")
  
  // Credit card pattern
  text = text.replace(/\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g, "[CARD_REDACTED]")
  
  // SSN pattern
  text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN_REDACTED]")
  
  // IP address pattern
  text = text.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP_REDACTED]")
  
  return text
}

// =====================================================
// LLM QUERY SERVICE
// =====================================================

/**
 * Default LLM provider configuration
 */
const DEFAULT_PROVIDER: LLMProvider = 'openai'
const DEFAULT_MODEL = 'gpt-4'
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 2000

/**
 * Fallback sequence for LLM providers
 */
const FALLBACK_SEQUENCE: LLMProvider[] = ['openai', 'anthropic', 'google']

/**
 * Query LLM with fallback support
 */
export async function queryLLM(
  promptText: string,
  options: LLMQueryOptions = {}
): Promise<{ text: string; provider: LLMProvider; model: string; tokens: number; cached: boolean }> {
  const provider = options.provider || DEFAULT_PROVIDER
  const model = options.model || DEFAULT_MODEL
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE
  const maxTokens = options.maxTokens || DEFAULT_MAX_TOKENS
  const deterministic = options.deterministic || false

  // Check cache first if enabled
  if (options.useCache) {
    const cached = await checkCache(promptText, provider, model)
    if (cached) {
      return {
        text: cached.response_text,
        provider: cached.llm_provider,
        model: cached.model_name || model,
        tokens: cached.tokens_used || 0,
        cached: true,
      }
    }
  }

  // Try providers in fallback sequence
  const providersToTry = options.provider
    ? [options.provider]
    : FALLBACK_SEQUENCE

  let lastError: Error | null = null

  for (const providerToTry of providersToTry) {
    try {
      const response = await callLLMProvider(providerToTry, promptText, {
        model,
        temperature: deterministic ? 0.1 : temperature,
        maxTokens,
      })

      return {
        text: response.text,
        provider: providerToTry,
        model: response.model,
        tokens: response.tokens,
        cached: false,
      }
    } catch (error) {
      lastError = error as Error
      console.warn(`Failed to query ${providerToTry}:`, error)
      // Continue to next provider
    }
  }

  // All providers failed
  throw lastError || new Error("All LLM providers failed")
}

/**
 * Call specific LLM provider (mock implementation - replace with actual API calls)
 */
async function callLLMProvider(
  provider: LLMProvider,
  promptText: string,
  options: {
    model: string
    temperature: number
    maxTokens: number
  }
): Promise<{ text: string; model: string; tokens: number }> {
  // TODO: Implement actual API calls to LLM providers
  // This is a placeholder that simulates an API call
  
  // For now, return a mock response
  // In production, this would call:
  // - OpenAI API: https://api.openai.com/v1/chat/completions
  // - Anthropic API: https://api.anthropic.com/v1/messages
  // - Google API: https://generativelanguage.googleapis.com/v1/models/{model}:generateContent
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        text: `[Mock response from ${provider} using ${options.model}]\n\nBased on the conversation, I would ask: "Could you please provide your ${promptText.includes('email') ? 'email address' : 'name'}?"`,
        model: options.model,
        tokens: Math.floor(promptText.length / 4) + Math.floor(Math.random() * 100) + 50, // Rough estimate
      })
    }, 500) // Simulate network delay
  })
}

// =====================================================
// CACHING SERVICE
// =====================================================

/**
 * Generate cache key from prompt and options
 */
export function generateCacheKey(
  promptText: string,
  provider: LLMProvider,
  model: string,
  deterministic: boolean
): string {
  const normalizedPrompt = promptText.trim().toLowerCase()
  const hash = simpleHash(normalizedPrompt)
  return `${provider}:${model}:${deterministic ? 'det' : 'var'}:${hash}`
}

/**
 * Simple hash function for cache keys
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Check if response exists in cache
 */
async function checkCache(
  promptText: string,
  provider: LLMProvider,
  model: string
): Promise<CreateResponseInput | null> {
  const cacheKey = generateCacheKey(promptText, provider, model, false)
  
  // Query responses table for cached response
  const { supabase } = await import("@/lib/supabase")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("responses")
    .select("*")
    .eq("cache_key", cacheKey)
    .eq("cached_flag", true)
    .eq("user_id", user.id)
    .gt("cache_expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (data) {
    return {
      prompt_id: data.prompt_id,
      agent_id: data.agent_id,
      llm_provider: data.llm_provider,
      model_name: data.model_name,
      response_text: data.response_text,
      response_data: data.response_data,
      cached_flag: true,
      cache_key: data.cache_key,
      cache_expires_at: data.cache_expires_at,
      tokens_used: data.tokens_used,
      tokens_input: data.tokens_input,
      tokens_output: data.tokens_output,
      temperature: data.temperature,
      deterministic_mode: data.deterministic_mode,
    }
  }

  return null
}

/**
 * Store response in cache
 */
export async function storeInCache(
  response: CreateResponseInput,
  ttlHours: number = 24
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + ttlHours)

  await llmOrchestrationApi.createResponse({
    ...response,
    cached_flag: true,
    cache_expires_at: expiresAt.toISOString(),
  })
}

// =====================================================
// LOGGING SERVICE
// =====================================================

/**
 * Calculate cost based on provider, model, and tokens
 */
export function calculateCost(
  provider: LLMProvider,
  model: string,
  tokensInput: number,
  tokensOutput: number
): number {
  // Pricing per 1M tokens (approximate)
  const pricing: Record<string, { input: number; output: number }> = {
    'openai:gpt-4': { input: 30, output: 60 },
    'openai:gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    'anthropic:claude-3-opus': { input: 15, output: 75 },
    'anthropic:claude-3-sonnet': { input: 3, output: 15 },
    'google:gemini-pro': { input: 0.5, output: 1.5 },
  }

  const key = `${provider}:${model}`
  const rates = pricing[key] || pricing['openai:gpt-3.5-turbo']

  const inputCost = (tokensInput / 1_000_000) * rates.input
  const outputCost = (tokensOutput / 1_000_000) * rates.output

  return inputCost + outputCost
}

/**
 * Log usage to database
 */
export async function logUsage(
  log: CreateUsageLogInput
): Promise<void> {
  await llmOrchestrationApi.createUsageLog(log)
}

// =====================================================
// MAIN ORCHESTRATION FUNCTION
// =====================================================

/**
 * Main orchestration function that combines all services
 */
export async function orchestrateLLM(
  input: PromptConstructionInput,
  options: LLMQueryOptions = {}
): Promise<LLMQueryResult> {
  const startTime = Date.now()

  // 1. Construct prompt
  const promptText = constructPrompt(input)
  const redactedPromptText = redactPII(promptText)

  // 2. Create prompt record
  const prompt = await llmOrchestrationApi.createPrompt({
    agent_id: input.agentId || null,
    persona_data: input.persona,
    knowledge_data: input.knowledge,
    schema_data: input.schema,
    prompt_text: redactedPromptText,
    conversation_history: input.conversationHistory || [],
    remaining_fields: input.remainingFields || [],
  })

  // 3. Query LLM
  const llmResult = await queryLLM(promptText, options)

  // 4. Create response record
  const response = await llmOrchestrationApi.createResponse({
    prompt_id: prompt.id,
    agent_id: input.agentId || null,
    llm_provider: llmResult.provider,
    model_name: llmResult.model,
    response_text: llmResult.text,
    response_data: {},
    cached_flag: llmResult.cached,
    cache_key: options.useCache ? generateCacheKey(promptText, llmResult.provider, llmResult.model, options.deterministic || false) : null,
    cache_expires_at: options.useCache ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
    tokens_used: llmResult.tokens,
    tokens_input: Math.floor(promptText.length / 4), // Rough estimate
    tokens_output: llmResult.tokens - Math.floor(promptText.length / 4),
    temperature: options.temperature,
    deterministic_mode: options.deterministic || false,
  })

  // 5. Store in cache if enabled and not already cached
  if (options.useCache && !llmResult.cached) {
    await storeInCache({
      prompt_id: prompt.id,
      agent_id: input.agentId || null,
      llm_provider: llmResult.provider,
      model_name: llmResult.model,
      response_text: llmResult.text,
      cached_flag: true,
      cache_key: generateCacheKey(promptText, llmResult.provider, llmResult.model, options.deterministic || false),
      cache_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      tokens_used: llmResult.tokens,
    })
  }

  // 6. Calculate cost
  const responseTime = Date.now() - startTime
  const cost = calculateCost(
    llmResult.provider,
    llmResult.model,
    Math.floor(promptText.length / 4),
    llmResult.tokens - Math.floor(promptText.length / 4)
  )

  // 7. Log usage
  const usageLog = await llmOrchestrationApi.createUsageLog({
    agent_id: input.agentId || null,
    prompt_id: prompt.id,
    response_id: response.id,
    tokens_used: llmResult.tokens,
    tokens_input: Math.floor(promptText.length / 4),
    tokens_output: llmResult.tokens - Math.floor(promptText.length / 4),
    cost,
    cost_currency: 'USD',
    llm_provider: llmResult.provider,
    model_name: llmResult.model,
    response_time_ms: responseTime,
    cache_hit: llmResult.cached,
  })

  return {
    response,
    usageLog,
    cached: llmResult.cached,
  }
}
