// API Client with JWT Bearer authentication and token refresh handling

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

class ApiService {
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  private getAccessToken(): string | null {
    return localStorage.getItem('teacher_access_token')
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('teacher_refresh_token')
  }

  public setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('teacher_access_token', accessToken)
    localStorage.setItem('teacher_refresh_token', refreshToken)
  }

  public clearTokens() {
    localStorage.removeItem('teacher_access_token')
    localStorage.removeItem('teacher_refresh_token')
    localStorage.removeItem('teacher_user_profile')
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(cb => cb(token))
    this.refreshSubscribers = []
  }

  private addRefreshSubscriber(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb)
  }

  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, headers = {}, ...rest } = options

    const requestHeaders: Record<string, string> = {
      ...(headers as Record<string, string>)
    }

    if (!(rest.body instanceof FormData) && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json'
    }

    if (requiresAuth) {
      const token = this.getAccessToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

    let response = await fetch(url, {
      ...rest,
      headers: requestHeaders
    })

    // Handle 401 Unauthorized -> try refresh token
    if (response.status === 401 && requiresAuth) {
      const refreshToken = this.getRefreshToken()
      if (refreshToken) {
        if (!this.isRefreshing) {
          this.isRefreshing = true
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            })

            if (refreshRes.ok) {
              const data = await refreshRes.json()
              this.setTokens(data.accessToken, data.refreshToken)
              if (data.user) {
                localStorage.setItem('teacher_user_profile', JSON.stringify(data.user))
              }
              this.isRefreshing = false
              this.onTokenRefreshed(data.accessToken)
            } else {
              this.isRefreshing = false
              this.clearTokens()
              window.location.href = '/teacher/login'
              throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
            }
          } catch (err) {
            this.isRefreshing = false
            this.clearTokens()
            window.location.href = '/teacher/login'
            throw err
          }
        }

        // Wait for token refresh to complete
        const retryToken = await new Promise<string>(resolve => {
          this.addRefreshSubscriber(resolve)
        })

        requestHeaders['Authorization'] = `Bearer ${retryToken}`
        response = await fetch(url, {
          ...rest,
          headers: requestHeaders
        })
      } else {
        this.clearTokens()
      }
    }

    if (!response.ok) {
      let errorMsg = `Yêu cầu thất bại (${response.status})`
      try {
        const errorData = await response.json()
        errorMsg = errorData.message || (errorData.errors ? Object.values(errorData.errors).flat().join('; ') : errorMsg)
      } catch {
        // use default errorMsg
      }
      throw new Error(errorMsg)
    }

    // Return json or text
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    return response.text() as unknown as T
  }

  public get<T = any>(endpoint: string, options: RequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  public post<T = any>(endpoint: string, body?: any, options: RequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    })
  }

  public put<T = any>(endpoint: string, body?: any, options: RequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    })
  }

  public delete<T = any>(endpoint: string, options: RequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new ApiService()
