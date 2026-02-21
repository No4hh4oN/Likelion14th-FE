"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { MyPageUser } from "../types";

type EditSectionProps = {
  user: MyPageUser;
  onBack: () => void;
};

type EditFormState = {
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
};

export default function EditSection({ user, onBack }: EditSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [form, setForm] = useState<EditFormState>({
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange =
    (key: keyof EditFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handlePhotoPick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPhotoPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return objectUrl;
    });
  };

  const handleEmailCheck = () => {
    // TODO: 이메일 중복 확인 API 연동
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: 사용자 정보 수정 API 연동
  };

  const handleWithdraw = () => {
    // TODO: 회원 탈퇴 API 연동
  };

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#24252E_0%,#1E1F27_100%)] px-4 py-10 text-white-1 lg:px-6 lg:py-14">
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
            className="rounded-[5px] bg-gray-6 px-4 py-1.5 text-[12px] font-medium text-white-1 transition-colors hover:bg-gray-5"
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
              className="h-9 rounded-[5px] border border-white/35 bg-transparent px-3 text-[12px] text-white placeholder:text-white/25 focus:border-main-1 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleEmailCheck}
              className="h-9 rounded-[5px] bg-main-1 text-[11px] font-medium text-white transition-colors hover:bg-main-1/85"
            >
              중복 확인
            </button>
          </div>

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
              className="h-9 rounded-[5px] border border-white/35 bg-transparent px-3 text-[12px] text-white placeholder:text-white/25 focus:border-main-1 focus:outline-none"
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
              className="h-9 rounded-[5px] border border-white/35 bg-transparent px-3 text-[12px] text-white placeholder:text-white/25 focus:border-main-1 focus:outline-none"
            />
          </div>

          <p className="pl-[68px] text-[10px] text-white/30">
            *4~20자 영문, 숫자, 기호만 가능합니다.
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
              className="h-9 rounded-[5px] border border-white/35 bg-transparent px-3 text-[12px] text-white placeholder:text-white/25 focus:border-main-1 focus:outline-none"
            />
          </div>

          <p className="pt-2 text-center text-[10px] text-gray-5">
            이 외의 정보 수정은 운영진에게 문의 바랍니다.
          </p>

          <div className="pt-1.5">
            <button
              type="submit"
              className="mx-auto block h-10 w-[120px] rounded-full bg-main-1 text-[14px] font-semibold text-white transition-colors hover:bg-main-1/85"
            >
              저장 하기
            </button>
            <button
              type="button"
              onClick={handleWithdraw}
              className="mx-auto mt-3 block h-9 w-[120px] rounded-full bg-[#8D96A8] text-[13px] font-medium text-white transition-colors hover:bg-[#7E8799]"
            >
              회원 탈퇴
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
