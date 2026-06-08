const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ptt_token')
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(error.message ?? `API error: ${res.status}`)
  }

  return res.json()
}

export function setToken(token: string) {
  localStorage.setItem('ptt_token', token)
}

export function clearToken() {
  localStorage.removeItem('ptt_token')
}
