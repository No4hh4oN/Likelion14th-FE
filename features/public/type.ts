export type SsoUser = {
    userUuid: string
    loginId: string
    email: string
    ssoRole: string
    status: string
    createdAt: string
}

export type HomepageProfile = {
    userUuid: string
    name: string
    department: string
    studentNo: string
    grade: number
    enrollment: "ENROLLED" | string
    birthDate: string
    phone: string
    status: "ACTIVE" | string
    createdAt: string
    updatedAt: string
}

export type UserRole = {
    id: number
    generation: number
    level: "OUTSIDER" | string
    track: "FRONTEND" | string
    position: "PRESIDENT" | string
    active: boolean
    createdAt: string
    updatedAt: string
}

export type MeResponse = {
    sso: SsoUser
    homepage: HomepageProfile
    roles: UserRole[]
}

export type LoginRequest = {
    loginId: string
    password: string
}

export type LoginResponse = {
    accessToken: string
}

export type LogoutResponse = {
    success: boolean
}

export type RefreshTokenResponse = {
    accessToken: string
}
