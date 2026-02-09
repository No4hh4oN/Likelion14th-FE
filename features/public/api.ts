import type {
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
    RefreshTokenResponse,
} from "@/features/public/type"
import { apiClient, clearAccessToken, setAccessToken } from "@/lib/axios"

export async function getMyInfo(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>("/users/me")
    return response.data
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", payload)
    const { accessToken } = response.data
    setAccessToken(accessToken)
    return response.data
}

export async function logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>("/auth/logout")
    clearAccessToken()
    return response.data
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>("/auth/token/refresh")
    const { accessToken } = response.data
    setAccessToken(accessToken)
    return response.data
}
