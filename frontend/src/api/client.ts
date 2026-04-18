const base = () => 'http://localhost:5000/api'.replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function isApiConfigured(): boolean {
  return Boolean(base())
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const url = `${base()}${path.startsWith('/') ? path : `/${path}`}`
  const headers: HeadersInit = {
    ...(init?.json !== undefined
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(init?.headers ?? {}),
  }
  const { json, ...rest } = init ?? {}
  const res = await fetch(url, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })
  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    throw new ApiError(
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: string }).message)
        : res.statusText,
      res.status,
      data
    )
  }
  return data as T
}
