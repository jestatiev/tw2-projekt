import { API_URL } from './config.js'
import { ERROR_KIND, kindFromStatus, userMessage } from '../logic/errors.js'

// Token i reakciju na 401 postavlja aplikacija pri pokretanju (store/setupHttp.js),
// pa servisni sloj ne mora ništa znati o Reduxu.
let getToken = () => null
let onUnauthorized = () => {}

export const configureHttp = (options) => {
  getToken = options.getToken ?? getToken
  onUnauthorized = options.onUnauthorized ?? onUnauthorized
}

export class ApiError extends Error {
  constructor({ kind, status, message, fields = {} }) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.fields = fields
  }
}

const readBody = async (response) => {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const request = async (method, path, { body, skipUnauthorizedHandler = false } = {}) => {
  const token = getToken()
  const headers = {
    Accept: 'application/json',
    ...(body !== undefined && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    console.error(`[http] ${method} ${path}: poslužitelj nije dostupan`, cause)
    throw new ApiError({ kind: ERROR_KIND.NETWORK, status: 0, message: userMessage(ERROR_KIND.NETWORK) })
  }

  const data = await readBody(response)
  if (response.ok) return data

  const kind = kindFromStatus(response.status)
  console.error(`[http] ${method} ${path} → ${response.status}`, data)

  // Istek tokena rješava se na jednom mjestu: ovdje, kroz onUnauthorized.
  if (kind === ERROR_KIND.UNAUTHORIZED && token && !skipUnauthorizedHandler) onUnauthorized()

  throw new ApiError({
    kind,
    status: response.status,
    message: userMessage(kind, data?.message),
    fields: data?.fields ?? {},
  })
}

export const http = {
  get: (path) => request('GET', path),
  post: (path, body, options) => request('POST', path, { body, ...options }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
}
