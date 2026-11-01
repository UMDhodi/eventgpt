/**
 * NVIDIA NIM LLM Integration Service
 * Model: minimaxai/minimax-m3.1-flash (via NVIDIA API Catalog)
 * Endpoint: https://integrate.api.nvidia.com/v1/chat/completions
 */

const DEFAULT_NVIDIA_API_KEY =
  process.env.NVIDIA_API_KEY ||
  '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'

const DEFAULT_BASE_URL =
  process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1'

const DEFAULT_MODEL =
  process.env.NVIDIA_MODEL || 'minimaxai/minimax-m3.1-flash'

export interface ChatMessageParam {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface NvidiaChatOptions {
  messages: ChatMessageParam[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  topP?: number
}

/**
 * Streams chat completion tokens from NVIDIA LLM endpoint as a Web ReadableStream
 */
export async function streamNvidiaChat({
  messages,
  systemPrompt,
  temperature = 0.7,
  maxTokens = 2048,
  topP = 0.95,
}: NvidiaChatOptions): Promise<ReadableStream<Uint8Array>> {
  const apiKey = DEFAULT_NVIDIA_API_KEY
  const invokeUrl = `${DEFAULT_BASE_URL}/chat/completions`

  const formattedMessages: ChatMessageParam[] = []
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt })
  }
  formattedMessages.push(...messages)

  const payload = {
    model: DEFAULT_MODEL,
    messages: formattedMessages,
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    stream: true,
  }

  // Fast 2s timeout: if NVIDIA NIM is queued or takes too long, abort cleanly so fallback takes over instantly
  const response = await fetch(invokeUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(2000),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`NVIDIA API HTTP ${response.status}: ${errorText}`)
  }

  const body = response.body
  if (!body) {
    throw new Error('NVIDIA API returned empty response body')
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const reader = body.getReader()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data:')) continue

            const dataStr = trimmed.slice(5).trim()
            if (dataStr === '[DONE]') {
              controller.close()
              return
            }

            try {
              const parsed = JSON.parse(dataStr)
              const deltaContent = parsed.choices?.[0]?.delta?.content
              if (deltaContent) {
                controller.enqueue(encoder.encode(deltaContent))
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }

        // Process leftover buffer
        if (buffer.trim().startsWith('data:')) {
          const dataStr = buffer.trim().slice(5).trim()
          if (dataStr && dataStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataStr)
              const deltaContent = parsed.choices?.[0]?.delta?.content
              if (deltaContent) {
                controller.enqueue(encoder.encode(deltaContent))
              }
            } catch {
              // ignore
            }
          }
        }

        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}

/**
 * Non-streaming chat completion with NVIDIA LLM
 */
export async function generateNvidiaChatCompletion({
  messages,
  systemPrompt,
  temperature = 0.7,
  maxTokens = 2048,
  topP = 0.95,
}: NvidiaChatOptions): Promise<string> {
  const apiKey = DEFAULT_NVIDIA_API_KEY
  const invokeUrl = `${DEFAULT_BASE_URL}/chat/completions`

  const formattedMessages: ChatMessageParam[] = []
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt })
  }
  formattedMessages.push(...messages)

  const payload = {
    model: DEFAULT_MODEL,
    messages: formattedMessages,
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    stream: false,
  }

  const response = await fetch(invokeUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`NVIDIA API HTTP ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

