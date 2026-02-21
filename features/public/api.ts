import type {
    CheckAvailabilityResponse,
    EmailActionResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
    RegisterPayload,
    RegisterRequest,
    RegisterResponse,
    RefreshTokenResponse,
    SendEmailCodeRequest,
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

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
    if (payload.profileImage) {
        const formData = new FormData()
        formData.append("loginId", payload.loginId)
        formData.append("email", payload.email)
        formData.append("password", payload.password)
        formData.append("name", payload.name)
        formData.append("department", payload.department)
        formData.append("studentNo", payload.studentNo)
        formData.append("grade", String(payload.grade))
        formData.append("enrollment", payload.enrollment)
        formData.append("birthDate", payload.birthDate)
        formData.append("phone", payload.phone)
        formData.append("profileImage", payload.profileImage)
        const debugEntries = Array.from(formData.entries()).map(([key, value]) => {
            if (key === "password") {
                return [key, `***masked*** (${String(value).length} chars)`]
            }
            if (value instanceof File) {
                return [key, { name: value.name, type: value.type, size: value.size }]
            }
            return [key, value]
        })
        console.log("[register] request mode: multipart/form-data")
        console.log("[register] request payload:", Object.fromEntries(debugEntries))

        try {
            const response = await apiClient.post<RegisterResponse>("/auth/register", formData)
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
    }
    console.log("[register] request mode: application/json")
    console.log("[register] request payload:", {
        ...requestBody,
        password: `***masked*** (${requestBody.password.length} chars)`,
    })

    try {
        const response = await apiClient.post<RegisterResponse>("/auth/register", requestBody, {
            headers: {
                "Content-Type": "application/json",
            },
        })
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
