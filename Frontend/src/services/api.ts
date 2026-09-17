// API Client with JWT Bearer authentication and token refresh handling

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7035/api'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

class ApiService {
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  private getAccessToken(): string | null {
    // Priority to teacher token if both exist (though unlikely in same profile)
    return localStorage.getItem('teacher_access_token') || localStorage.getItem('student_access_token')
  }

  private getRefreshToken(): string | null {
    // If we have a teacher access token, try its refresh token
    if (localStorage.getItem('teacher_access_token')) {
      return localStorage.getItem('teacher_refresh_token')
    }
    // Otherwise try student refresh token
    return localStorage.getItem('student_refresh_token')
  }

  public setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('teacher_access_token', accessToken)
    localStorage.setItem('teacher_refresh_token', refreshToken)
  }

  public setStudentTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('student_access_token', accessToken)
    if (refreshToken) localStorage.setItem('student_refresh_token', refreshToken)
  }

  public clearTokens() {
    this.clearTeacherTokens()
    this.clearStudentTokens()
    localStorage.removeItem('recentClassSlug')
  }

  public clearTeacherTokens() {
    localStorage.removeItem('teacher_access_token')
    localStorage.removeItem('teacher_refresh_token')
    localStorage.removeItem('teacher_user_profile')
  }

  public clearStudentTokens() {
    localStorage.removeItem('student_access_token')
    localStorage.removeItem('student_refresh_token')
    localStorage.removeItem('student_profile')
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

    if (rest.body instanceof FormData) {
      // Strip manual multipart/form-data so the browser can automatically set the boundary
      const contentTypeKey = Object.keys(requestHeaders).find(k => k.toLowerCase() === 'content-type')
      if (contentTypeKey && requestHeaders[contentTypeKey].includes('multipart/form-data')) {
        delete requestHeaders[contentTypeKey]
      }
    } else if (!requestHeaders['Content-Type']) {
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
              const isTeacher = !!localStorage.getItem('teacher_access_token')
              if (isTeacher) {
                this.setTokens(data.accessToken, data.refreshToken)
                if (data.user) {
                  localStorage.setItem('teacher_user_profile', JSON.stringify(data.user))
                }
              } else {
                this.setStudentTokens(data.accessToken, data.refreshToken)
                if (data.user) {
                  localStorage.setItem('student_profile', JSON.stringify(data.user))
                }
              }
              this.isRefreshing = false
              this.onTokenRefreshed(data.accessToken)
            } else {
              this.isRefreshing = false
              const isTeacher = !!localStorage.getItem('teacher_access_token')
              this.clearTokens()
              window.location.href = isTeacher ? '/teacher/login' : '/student/login'
              throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
            }
          } catch (err) {
            this.isRefreshing = false
            const isTeacher = !!localStorage.getItem('teacher_access_token')
            this.clearTokens()
            window.location.href = isTeacher ? '/teacher/login' : '/student/login'
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
