export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function streamChat(
  messages: Message[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
): () => void {
  const controller = new AbortController()

  ;(async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      })

      if (!response.ok) {
        onError(`Server error: ${response.status}`)
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6)) as { token?: string; done?: boolean }
          if (data.done) {
            onDone()
          } else if (data.token) {
            onToken(data.token)
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        onError((err as Error).message || 'Unknown error')
      }
    }
  })()

  return () => controller.abort()
}
