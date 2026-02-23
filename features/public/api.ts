import type {
    CheckAvailabilityResponse,
    EmailActionResponse,
    FindIdVerifyRequest,
    FindIdVerifyResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
    RegisterPayload,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordVerifyRequest,
    RefreshTokenResponse,
    SendEmailCodeRequest,
    UploadProfileImageResponse,
    VerifyEmailCodeRequest,
} from "@/features/public/type"
import { isAxiosError } from "axios"
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

export async function checkLoginIdAvailability(value: string): Promise<CheckAvailabilityResponse> {
    const response = await apiClient.get<CheckAvailabilityResponse>("/auth/check/login-id", {
        params: { value },
    })
    return response.data
}

export async function checkEmailAvailability(value: string): Promise<CheckAvailabilityResponse> {
    const response = await apiClient.get<CheckAvailabilityResponse>("/auth/check/email", {
        params: { value },
    })
    return response.data
}

export async function checkStudentNoAvailability(value: string): Promise<CheckAvailabilityResponse> {
    const response = await apiClient.get<CheckAvailabilityResponse>("/auth/check/student-no", {
        params: { value },
    })
    return response.data
}

export async function checkPhoneAvailability(value: string): Promise<CheckAvailabilityResponse> {
    const response = await apiClient.get<CheckAvailabilityResponse>("/auth/check/phone", {
        params: { value },
    })
    return response.data
}

export async function sendEmailCode(payload: SendEmailCodeRequest): Promise<EmailActionResponse> {
    const response = await apiClient.post<EmailActionResponse>("/auth/email/send", payload)
    return response.data
}

export async function verifyEmailCode(payload: VerifyEmailCodeRequest): Promise<EmailActionResponse> {
    const response = await apiClient.post<EmailActionResponse>("/auth/email/verify", payload)
    return response.data
}

export async function findIdByEmailVerify(payload: FindIdVerifyRequest): Promise<FindIdVerifyResponse> {
    const response = await apiClient.post<FindIdVerifyResponse>("/auth/email/find-id/verify", payload)
    return response.data
}

export async function resetPasswordByEmailVerify(payload: ResetPasswordVerifyRequest): Promise<EmailActionResponse> {
    const response = await apiClient.post<EmailActionResponse>("/auth/email/reset-password/verify", payload)
    return response.data
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
    const requestBody: RegisterRequest = {
        loginId: payload.loginId,
        email: payload.email,
        password: payload.password,
        name: payload.name,
        department: payload.department,
        studentNo: payload.studentNo,
        grade: payload.grade,
        enrollment: payload.enrollment,
        birthDate: payload.birthDate,
        phone: payload.phone,
        profileImageId: payload.profileImageId,
    }
    console.log("[register] request mode: application/json")
    console.log("[register] request payload:", {
        ...requestBody,
        password: `***masked*** (${requestBody.password.length} chars)`,
    })

    try {
        const response = await apiClient.post<RegisterResponse>("/auth/register", requestBody)
        return response.data
    } catch (error) {
        if (isAxiosError(error)) {
            console.error("[register] failed response:", {
                status: error.response?.status,
                data: error.response?.data,
            })
        } else {
            console.error("[register] unexpected error:", error)
        }
        throw error
    }
}

export async function uploadProfileImage(profileImage: File): Promise<UploadProfileImageResponse> {
    try {
        const response = await apiClient.postForm<UploadProfileImageResponse>(
            "/auth/profile-image",
            {
                profileImage,
            },
            {
                timeout: 60000,
            },
        )
        return response.data
    } catch (error) {
        if (isAxiosError(error)) {
            console.error("[uploadProfileImage] failed response:", {
                status: error.response?.status,
                data: error.response?.data,
                code: error.code,
                message: error.message,
            })
        } else {
            console.error("[uploadProfileImage] unexpected error:", error)
        }
        throw error
    }
}
