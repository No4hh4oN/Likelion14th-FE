"use client"

import Image from "next/image"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { resetPasswordByEmailVerify, sendEmailCode } from "@/features/public/api"

type Step = 1 | 2

export default function FindPwFeature() {
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)
    const [loginId, setLoginId] = useState("")
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isSendingCode, setIsSendingCode] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccessPopupVisible, setIsSuccessPopupVisible] = useState(false)
    const [message, setMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const passwordRule = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,20}$/
    const isPasswordValid = passwordRule.test(newPassword)
    const canGoNext = loginId.trim().length > 0 && email.trim().length > 0 && code.trim().length > 0

    const canSubmit = useMemo(() => canGoNext && isPasswordValid, [canGoNext, isPasswordValid])

    useEffect(() => {
        if (!isSuccessPopupVisible) {
            return
        }

        const completeTimer = window.setTimeout(() => {
            setIsSuccessPopupVisible(false)
            router.replace("/auth")
        }, 1400)

        return () => {
            window.clearTimeout(completeTimer)
        }
    }, [isSuccessPopupVisible, router])

    const handleSendCode = async () => {
        if (!email) {
            setErrorMessage("이메일을 먼저 입력해주세요.")
            return
        }

        setErrorMessage("")
        setMessage("")
        setIsSendingCode(true)

        try {
            const result = await sendEmailCode({
                email,
                purpose: "RESET_PASSWORD",
                loginId: loginId || undefined,
            })
            setMessage(result.message || "인증번호를 전송했습니다.")
        } catch {
            setErrorMessage("인증번호 전송에 실패했습니다.")
        } finally {
            setIsSendingCode(false)
        }
    }

    const handleNext = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setErrorMessage("")
        setMessage("")

        if (!canGoNext) {
            setErrorMessage("ID, E-MAIL, 인증번호를 모두 입력해주세요.")
            return
        }

        setStep(2)
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setErrorMessage("")
        setMessage("")

        if (!isPasswordValid) {
            setErrorMessage("비밀번호는 8~20자 영문, 숫자, 특수문자를 포함해야 합니다.")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await resetPasswordByEmailVerify({
                loginId,
                email,
                code,
                newPassword,
            })

            if (!result.ok) {
                setErrorMessage(result.message || "비밀번호 재설정에 실패했습니다.")
                return
            }

            setMessage(result.message || "비밀번호가 재설정되었습니다.")
            setIsSuccessPopupVisible(true)
        } catch {
            setErrorMessage("비밀번호 재설정에 실패했습니다.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="relative mx-auto mt-27 w-full max-w-4xl pt-28">
            <Image
                className="pointer-events-none absolute left-1/2 top-20 z-0 h-[108px] w-[82px] -translate-x-1/2 -translate-y-1/2 md:h-[216px] md:w-[164px]"
                src="/images/authLion.webp"
                alt="authLion"
                width={164}
                height={216}
                priority
            />

            <section className="relative z-10 min-h-[calc(100vh-220px)] w-full rounded-t-[56px] bg-[linear-gradient(180deg,#484D5A_-23.29%,#303136_46.27%)] px-4 pb-9 pt-16 md:rounded-t-[225px]">
                <div className="mx-auto max-w-[520px]">
                    <div className="mb-6 flex flex-col items-center">
                        <div className="mb-3 h-[72px] w-[72px] overflow-hidden rounded-full bg-white p-2">
                            <Image src="/images/syuLikelion.webp" alt="logo" width={56} height={56} />
                        </div>
                        <h1 className="text-lg font-bold text-main-3 md:text-xl">비밀번호 재설정</h1>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleNext} className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-lg font-bold text-foreground md:text-xl">ID</span>
                                <input
                                    value={loginId}
                                    onChange={(event) => setLoginId(event.target.value)}
                                    required
                                    placeholder="아이디를 입력해주세요."
                                    className="h-12.5 w-full rounded-[14px] border border-[#484d5a] bg-gray-6 px-6 text-base text-gray-4 outline-none md:h-20 md:rounded-2xl md:text-xl"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-lg font-bold text-foreground md:text-xl">E-MAIL</span>
                                <div className="flex gap-2">
                                    <input
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        type="email"
                                        required
                                        placeholder="이메일을 입력해주세요."
                                        className="h-12.5 w-full rounded-[14px] border border-[#484d5a] bg-gray-6 px-6 text-base text-gray-4 outline-none md:h-20 md:rounded-2xl md:text-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={isSendingCode}
                                        className="h-12.5 w-[87px] shrink-0 rounded-[14px] bg-main-1 px-2 text-sm font-bold text-white disabled:opacity-60 md:h-20 md:w-[146px] md:rounded-2xl md:px-3 md:text-base"
                                    >
                                        {isSendingCode ? "전송 중" : "인증번호 전송"}
                                    </button>
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-lg font-bold text-foreground md:text-xl">인증번호</span>
                                <input
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    required
                                    placeholder="인증번호를 입력해주세요."
                                    className="h-12.5 w-full rounded-[14px] border border-[#484d5a] bg-gray-6 px-6 text-base text-gray-4 outline-none md:h-20 md:rounded-2xl md:text-xl"
                                />
                            </label>

                            {message ? <p className="text-xs text-[#7ee787]">{message}</p> : null}
                            {errorMessage ? <p className="text-xs text-[#ff7b7b]">{errorMessage}</p> : null}

                            <div className="pt-2 text-center">
                                <button
                                    type="submit"
                                    disabled={!canGoNext}
                                    className="inline-flex h-12.5 items-center rounded-[14px] bg-main-1 px-8 text-lg font-bold text-white disabled:opacity-60 md:h-20 md:rounded-2xl md:text-xl"
                                >
                                    다음
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-lg font-bold text-foreground md:text-xl">NEW PASSWORD</span>
                                <input
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    type="password"
                                    required
                                    placeholder="새 비밀번호를 입력해주세요."
                                    className="h-12.5 w-full rounded-[14px] border border-[#484d5a] bg-gray-6 px-6 text-base text-gray-4 outline-none md:h-20 md:rounded-2xl md:text-xl"
                                />
                            </label>
                            <p className="text-xs text-gray-400">*8~20자 영문, 숫자, 특수문자를 포함해야 합니다.</p>
                            {newPassword.length > 0 ? (
                                <p className={`text-xs ${isPasswordValid ? "text-[#7ee787]" : "text-[#ff7b7b]"}`}>
                                    {isPasswordValid
                                        ? "*사용 가능한 비밀번호 형식입니다."
                                        : "*비밀번호 형식이 올바르지 않습니다."}
                                </p>
                            ) : null}

                            <div className="pt-2 text-center">
                                <button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className="inline-flex h-12.5 items-center rounded-[14px] bg-main-1 px-8 text-lg font-bold text-white disabled:opacity-60 md:h-20 md:rounded-2xl md:text-xl"
                                >
                                    {isSubmitting ? "처리 중" : "비밀번호 재설정"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>

            {isSuccessPopupVisible ? (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4">
                    <div className="w-full max-w-[320px] rounded-2xl bg-white p-6 text-center shadow-2xl">
                        <p className="text-base font-bold text-[#303136]">비밀번호가 성공적으로 변경되었습니다.</p>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
