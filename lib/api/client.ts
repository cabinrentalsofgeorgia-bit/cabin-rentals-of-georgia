/**
 * API client for backend communication
 */
import axios, { AxiosInstance, AxiosError } from 'axios'

const DIRECT_API_URL = process.env.NEXT_PUBLIC_API_URL
const IS_BROWSER = typeof window !== 'undefined'
const API_URL = IS_BROWSER ? '/api/proxy' : DIRECT_API_URL

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
          config.headers['CF-Access-Client-Id'] = process.env.CF_ACCESS_CLIENT_ID
          config.headers['CF-Access-Client-Secret'] = process.env.CF_ACCESS_CLIENT_SECRET
        }

        config.headers['Origin'] = 'https://crog-ai.com'
        config.headers['Referer'] = 'https://crog-ai.com/'
        config.headers['X-Forwarded-Host'] = 'crog-ai.com'

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle errors globally (only in browser)
        if (typeof window !== 'undefined') {
          if (error.response?.status === 401) {
            // Handle unauthorized
            localStorage.removeItem('token')
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  get instance() {
    return this.client
  }
}

export const apiClient = new ApiClient().instance

