import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
const ACCESS_TOKEN_KEY = "accessToken"
export const AUTH_CHANGED_EVENT = "auth-changed"

let canRetryRefresh = true

function emitAuthChanged(): void {
    if (typeof window === "undefined") {
        return
    }

    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function getAccessToken(): string | null {
    if (typeof window === "undefined") {
        return null
    }

    return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
    if (typeof window === "undefined") {
        return
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
    canRetryRefresh = true
    emitAuthChanged()
}

export function clearAccessToken(): void {
    if (typeof window === "undefined") {
        return
    }

    const hadToken = window.localStorage.getItem(ACCESS_TOKEN_KEY) !== null
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)

    if (hadToken) {
        emitAuthChanged()
    }
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
})

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean
}

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
    const response = await refreshClient.post<{ accessToken: string }>("/auth/token/refresh")
    const nextToken = response.data.accessToken
    setAccessToken(nextToken)
    canRetryRefresh = true
    return nextToken
}

apiClient.interceptors.request.use((config) => {
    config.headers.Accept = "application/json"

    const accessToken = getAccessToken()
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined
        const status = error.response?.status

        if (!originalRequest || status !== 401) {
            return Promise.reject(error)
        }

        const requestUrl = originalRequest.url ?? ""
        const isRefreshRequest = requestUrl.includes("/auth/token/refresh")
        const isLoginRequest = requestUrl.includes("/auth/login")
        const isLogoutRequest = requestUrl.includes("/auth/logout")

        if (isLoginRequest || isLogoutRequest) {
            return Promise.reject(error)
        }

        if (!canRetryRefresh) {
            return Promise.reject(new Error("UNAUTHORIZED"))
        }

        if (isRefreshRequest || originalRequest._retry) {
            canRetryRefresh = false
            clearAccessToken()
            return Promise.reject(new Error("UNAUTHORIZED"))
        }

        originalRequest._retry = true

        try {
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => {
                    refreshPromise = null
                })
            }

            const nextToken = await refreshPromise
            originalRequest.headers.Authorization = `Bearer ${nextToken}`
            return apiClient(originalRequest)
        } catch {
            canRetryRefresh = false
            clearAccessToken()
            return Promise.reject(new Error("UNAUTHORIZED"))
        }
    },
)