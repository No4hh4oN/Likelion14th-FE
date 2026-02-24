"use client";

import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  checkEmailAvailability,
  sendEmailCode,
  verifyEmailCode,
} from "@/features/public/api";
import {
  getMyProfile,
  updateMyProfile,
  updateMyProfileImage,
  withdrawMe,
} from "../api";
import type { MyPageUser, UpdateMyProfileRequest } from "../types";

type EditSectionProps = {
  user: MyPageUser;
  onBack: () => void;
};

type EditFormState = {
  email: string;
  emailCode: string;
  phone: string;
  password: string;
  passwordConfirm: string;
};

type BaselineProfile = {
  email: string;
  phone: string;
};

const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,20}$/;

function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "object" && data !== null) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }

      const code = (data as { code?: unknown }).code;
      if (typeof code === "string" && code.trim().length > 0) {
        return `${fallback} (${code})`;
      }
    }
  }

  return fallback;
}

export default function EditSection({ user, onBack }: EditSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [ssoLoginId, setSsoLoginId] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [baselineProfile, setBaselineProfile] = useState<BaselineProfile>({
    email: "",
    phone: "",
  });
  const [form, setForm] = useState<EditFormState>({
    email: "",
    emailCode: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [isVerifyingEmailCode, setIsVerifyingEmailCode] = useState(false);
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setIsProfileLoading(true);
      setErrorMessage("");

      try {
        const response = await getMyProfile();
        if (!isMounted) {
          return;
        }

        const email = response.sso.email ?? "";
        const loginId = response.sso.loginId ?? "";
        const phone = response.homepage.phone ?? "";
        const profileImageUrl = response.homepage.profileImage?.url ?? null;

        setSsoLoginId(loginId);
        setBaselineProfile({ email, phone });
        setForm({
          email,
          emailCode: "",
          phone,
          password: "",
          passwordConfirm: "",
        });
        setPhotoPreview(profileImageUrl);
        setSelectedPhotoFile(null);
        setIsEmailAvailable(null);
        setIsEmailCodeSent(false);
        setIsEmailVerified(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "내 정보를 불러오지 못했습니다."),
        );
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange =
    (key: keyof EditFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));

      if (key === "email") {
        setIsEmailAvailable(null);
        setIsEmailCodeSent(false);
        setIsEmailVerified(false);
        setForm((prev) => ({ ...prev, emailCode: "" }));
      }
    };

  const handlePhotoPick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview((prev) => {
      if (prev?.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return objectUrl;
    });
    setSelectedPhotoFile(file);
  };

  const handleEmailCheck = async () => {
    const email = form.email.trim();
    if (!email) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    if (email === baselineProfile.email) {
      setIsEmailAvailable(true);
      setIsEmailCodeSent(false);
      setIsEmailVerified(false);
      setMessage("현재 이메일과 동일합니다.");
      setErrorMessage("");
      return;
    }

    setIsCheckingEmail(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await checkEmailAvailability(email);
      setIsEmailAvailable(response.available);

      if (response.available) {
        setMessage("사용 가능한 이메일입니다. 인증번호를 전송하세요.");
      } else {
        setErrorMessage("이미 사용 중인 이메일입니다.");
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "이메일 중복 확인에 실패했습니다."),
      );
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSendEmailCode = async () => {
    const email = form.email.trim();

    if (!email) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    if (email === baselineProfile.email) {
      setErrorMessage("현재 이메일과 동일한 경우 인증이 필요하지 않습니다.");
      return;
    }

    if (isEmailAvailable !== true) {
      setErrorMessage("먼저 이메일 중복 확인을 완료해주세요.");
      return;
    }

    setIsSendingEmailCode(true);
    setMessage("");
    setErrorMessage("");

    try {
      const result = await sendEmailCode({
        email,
        purpose: "NEW_EMAIL",
        loginId: ssoLoginId || undefined,
      });
      if (result.ok) {
        setIsEmailCodeSent(true);
        setIsEmailVerified(false);
        setMessage(result.message || "인증번호가 전송되었습니다.");
      } else {
        setErrorMessage(result.message || "인증번호 전송에 실패했습니다.");
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "인증번호 전송에 실패했습니다."),
      );
    } finally {
      setIsSendingEmailCode(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    const email = form.email.trim();
    const code = form.emailCode.trim();

    if (!email || email === baselineProfile.email) {
      setErrorMessage("변경할 이메일을 먼저 입력해주세요.");
      return;
    }

    if (!isEmailCodeSent) {
      setErrorMessage("인증번호를 먼저 전송해주세요.");
      return;
    }

    if (!code) {
      setErrorMessage("인증번호를 입력해주세요.");
      return;
    }

    setIsVerifyingEmailCode(true);
    setMessage("");
    setErrorMessage("");

    try {
      const result = await verifyEmailCode({ email, code });
      setIsEmailVerified(result.ok);

      if (result.ok) {
        setMessage(result.message || "이메일 인증이 완료되었습니다.");
      } else {
        setErrorMessage(result.message || "이메일 인증에 실패했습니다.");
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "이메일 인증에 실패했습니다."));
    } finally {
      setIsVerifyingEmailCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving || isWithdrawing || isProfileLoading) {
      return;
    }

    const email = form.email.trim();
    const phone = form.phone.trim();
    const normalizedPhone = phone.replace(/\D/g, "");
    const baselinePhone = baselineProfile.phone.trim();
    const baselineNormalizedPhone = baselinePhone.replace(/\D/g, "");
    const newPassword = form.password.trim();

    const emailChanged = email !== baselineProfile.email;
    const phoneChanged = normalizedPhone !== baselineNormalizedPhone;
    const passwordChanged = newPassword.length > 0;
    const photoChanged = selectedPhotoFile !== null;

    setMessage("");
    setErrorMessage("");

    if (passwordChanged && !PASSWORD_RULE.test(newPassword)) {
      setErrorMessage("비밀번호는 8~20자 영문, 숫자, 특수문자를 포함해야 합니다.");
      return;
    }

    if (passwordChanged && newPassword !== form.passwordConfirm) {
      setErrorMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (emailChanged && isEmailAvailable !== true) {
      setErrorMessage("이메일 변경 전 중복 확인을 완료해주세요.");
      return;
    }

    if (emailChanged && !isEmailVerified) {
      setErrorMessage("이메일 인증이 필요합니다.");
      return;
    }

    if (!emailChanged && !phoneChanged && !passwordChanged && !photoChanged) {
      setMessage("변경된 내용이 없습니다.");
      return;
    }

    setIsSaving(true);

    try {
      if (photoChanged && selectedPhotoFile) {
        const imageResponse = await updateMyProfileImage(selectedPhotoFile);
        setPhotoPreview(imageResponse.profileImage.url);
        setSelectedPhotoFile(null);
      }

      const payload: UpdateMyProfileRequest = {};
      if (emailChanged) {
        payload.email = email;
        // Workaround: some server builds fail when only email is provided.
        // Include current phone as well to keep payload non-partial for homepage fields.
        payload.phone = normalizedPhone || baselineNormalizedPhone;
      }
      if (phoneChanged) {
        payload.phone = normalizedPhone;
      }
      if (passwordChanged) {
        payload.newPassword = newPassword;
      }

      if (Object.keys(payload).length > 0) {
        await updateMyProfile(payload);
      }

      setBaselineProfile((prev) => ({
        email: emailChanged ? email : prev.email,
        phone: phoneChanged ? normalizedPhone : prev.phone,
      }));
      setForm((prev) => ({
        ...prev,
        email,
        emailCode: "",
        phone: phoneChanged ? normalizedPhone : phone,
        password: "",
        passwordConfirm: "",
      }));
      setIsEmailAvailable(emailChanged ? true : isEmailAvailable);
      setIsEmailCodeSent(false);
      setIsEmailVerified(false);
      setMessage("내 정보가 수정되었습니다.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "내 정보 수정에 실패했습니다."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (isWithdrawing || isSaving) {
      return;
    }

    const confirmed = window.confirm(
      "정말 회원 탈퇴하시겠습니까? 탈퇴 후 복구할 수 없습니다.",
    );
    if (!confirmed) {
      return;
    }

    setIsWithdrawing(true);
    setMessage("");
    setErrorMessage("");

    try {
      await withdrawMe();
      router.replace("/auth");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "회원 탈퇴에 실패했습니다."));
      setIsWithdrawing(false);
    }
  };

  return (
    <section className="min-h-screen bg-background px-4 text-white-1 lg:px-6">
      <div className="mx-auto w-full max-w-[420px] rounded-[8px] border border-white/10 bg-[#2E313A]/95 px-5 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.28)] lg:max-w-[470px] lg:px-9 lg:py-8">
        <div className="relative">
          <button
            type="button"
            onClick={onBack}
            className="absolute right-0 top-0 h-8 w-8 text-[28px] leading-none text-white/35 transition-colors hover:text-white/80"
            aria-label="닫기"
          >
            ×
          </button>
          <h1 className="text-center text-[24px] font-bold lg:text-[30px]">
            내 정보
          </h1>
        </div>

        <p className="mt-6 text-center text-[12px] text-white/70">
          프로필 사진
        </p>
        <div className="mt-2 flex justify-center">
          <div className="h-[92px] w-[92px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_25%,#D8DEF2_0%,#9AA8D2_54%,#6B74A3_100%)]">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="프로필 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[32px] font-bold text-[#2F3648]">
                M
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={handlePhotoPick}
            disabled={isProfileLoading || isSaving || isWithdrawing}
            className="rounded-[5px] bg-gray-6 px-4 py-1.5 text-[12px] font-medium text-white-1 transition-colors hover:bg-gray-5 disabled:opacity-60"
          >
            사진 수정
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <p className="mt-4 text-center text-[24px] font-semibold lg:text-[28px]">
          {user.name}님
        </p>

        <form className="mt-7 space-y-3.5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-[66px_minmax(0,1fr)_72px] items-center gap-2">
            <label htmlFor="edit-email" className="text-[12px] font-medium">
              이메일
            </label>
            <input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="이메일 입력"
              disabled={isProfileLoading || isSaving || isWithdrawing}
              className="h-9 rounded-[5px] border border-white/35 bg-transparent px-3 text-[12px] text-white placeholder:text-white/25 focus:border-main-1 focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleEmailCheck}
              disabled={
                isProfileLoading ||
                isSaving ||
                isWithdrawing ||
                isCheckingEmail ||
                isEmailAvailable === true ||
                form.email.trim().length === 0
              }
              className="h-9 rounded-[5px] bg-main-1 text-[11px] font-medium text-white transition-colors hover:bg-main-1/85 disabled:opacity-60"
            >
              {isCheckingEmail ? "확인 중" : "중복 확인"}
            </button>
          </div>
          {isEmailAvailable !== null ? (
            <p
              className={`pl-[68px] text-[10px] ${
                isEmailAvailable ? "text-[#7ee787]" : "text-[#ff7b7b]"
              }`}
            >
              {isEmailAvailable
                ? "사용 가능한 이메일입니다."
                : "이미 사용 중인 이메일입니다."}
            </p>
          ) : null}

          <div className="grid grid-cols-[66px_minmax(0,1fr)_72px] items-center gap-2">
            <label htmlFor="edit-email-code" className="text-[12px] font-medium">
              인증번호
            </label>
            <input
              id="edit-email-code"
              type="text"
              value={form.emailCode}
              onChange={handleChange("emailCode")}
              placeholder="인증번호 입력"
              disabled={isProfileLoading || isSaving || isWithdrawing}
              className="h-9 rounded-[5px] border border-white/35 bg-transparent px-3 text-[12px] text-white placeholder:text-white/25 focus:border-main-1 focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSendEmailCode}
              disabled={
                isProfileLoading ||
                isSaving ||
                isWithdrawing ||
                isSendingEmailCode ||
                form.email.trim().length === 0
              }
              className="h-9 rounded-[5px] bg-[#5E9DFF] text-[11px] font-medium text-white transition-colors hover:bg-[#4E8DEB] disabled:opacity-60"
            >
              {isSendingEmailCode
                ? "전송 중"
                : isEmailCodeSent
                  ? "다시 전송"
                  : "코드 전송"}
            </button>
          </div>
          <div className="grid grid-cols-[66px_minmax(0,1fr)_72px] items-center gap-2">
            <span className="text-[12px] font-medium" />
            <span className="text-[10px] text-white/60">
              {isEmailCodeSent
                ? "인증번호가 전송되었습니다. 확인 버튼을 눌러 인증하세요."
                : "중복 확인 후 인증번호를 전송하세요."}
            </span>
            <button
              type="button"
              onClick={handleVerifyEmailCode}
              disabled={
                isProfileLoading ||
                isSaving ||
                isWithdrawing ||
                isVerifyingEmailCode ||
                isEmailVerified ||
                !isEmailCodeSent ||
                form.emailCode.trim().length === 0
              }
              className="h-9 rounded-[5px] bg-[#3B82F6] text-[11px] font-medium text-white transition-colors hover:bg-[#2F6FCE] disabled:opacity-60"
            >
              {isVerifyingEmailCode ? "확인 중" : "인증 확인"}
            </button>
          </div>
          {isEmailVerified ? (
            <p className="pl-[68px] text-[10px] text-[#7ee787]">
              이메일 인증이 완료되었습니다.
            </p>
          ) : null}

          <div className="grid grid-cols-[66px_minmax(0,1fr)] items-center gap-2">
            <label htmlFor="edit-phone" className="text-[12px] font-medium">
              전화번호
            </label>
            <input
              id="edit-phone"
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="전화번호 입력"
              disabled={isProfileLoading || isSaving || isWithdrawing}
              className="h-9 rounded-[5px] border border-white/35 bg-transparent px-3 text-[12px] text-white placeholder:text-white/25 focus:border-main-1 focus:outline-none disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-[66px_minmax(0,1fr)] items-center gap-2">
            <label htmlFor="edit-password" className="text-[12px] font-medium">
              비밀번호
            </label>
            <input
              id="edit-password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="비밀번호 입력"
              disabled={isProfileLoading || isSaving || isWithdrawing}
              className="h-9 rounded-[5px] border border-white/35 bg-transparent px-3 text-[12px] text-white placeholder:text-white/25 focus:border-main-1 focus:outline-none disabled:opacity-60"
            />
          </div>

          <p className="pl-[68px] text-[10px] text-white/30">
            *8~20자 영문, 숫자, 특수문자를 포함해야 합니다.
          </p>

          <div className="grid grid-cols-[66px_minmax(0,1fr)] items-center gap-2">
            <label
              htmlFor="edit-password-confirm"
              className="text-[12px] font-medium"
            >
              비밀번호 확인
            </label>
            <input
              id="edit-password-confirm"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange("passwordConfirm")}
              placeholder="비밀번호 확인"
              disabled={isProfileLoading || isSaving || isWithdrawing}
              className="h-9 rounded-[5px] border border-white/35 bg-transparent px-3 text-[12px] text-white placeholder:text-white/25 focus:border-main-1 focus:outline-none disabled:opacity-60"
            />
          </div>

          <p className="pt-2 text-center text-[10px] text-gray-5">
            이 외의 정보 수정은 운영진에게 문의 바랍니다.
          </p>

          {message ? (
            <p className="text-center text-[12px] text-[#7ee787]">{message}</p>
          ) : null}
          {errorMessage ? (
            <p className="text-center text-[12px] text-[#ff9ea8]">
              {errorMessage}
            </p>
          ) : null}

          <div className="pt-1.5">
            <button
              type="submit"
              disabled={isProfileLoading || isSaving || isWithdrawing}
              className="mx-auto block h-10 w-[120px] rounded-full bg-main-1 text-[14px] font-semibold text-white transition-colors hover:bg-main-1/85 disabled:opacity-60"
            >
              {isSaving ? "저장 중..." : "저장 하기"}
            </button>
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={isProfileLoading || isSaving || isWithdrawing}
              className="mx-auto mt-3 block h-9 w-[120px] rounded-full bg-[#8D96A8] text-[13px] font-medium text-white transition-colors hover:bg-[#7E8799] disabled:opacity-60"
            >
              {isWithdrawing ? "탈퇴 처리 중..." : "회원 탈퇴"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}


