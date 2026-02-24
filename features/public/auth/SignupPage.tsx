"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  checkLoginIdAvailability,
  checkPhoneAvailability,
  checkStudentNoAvailability,
  register,
  sendEmailCode,
  uploadProfileImage,
  verifyEmailCode,
} from "@/features/public/api";

type FormState = {
  loginId: string;
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  department: string;
  studentNo: string;
  grade: string;
  enrollment: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  phone: string;
  code: string;
};

const INITIAL_FORM: FormState = {
  loginId: "",
  email: "",
  password: "",
  passwordConfirm: "",
  name: "",
  department: "",
  studentNo: "",
  grade: "1",
  enrollment: "ENROLLED",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  phone: "",
  code: "",
};

const DEPARTMENTS = [
  "신학과",
  "간호학과",
  "약학과",
  "자유전공학부(창의)",
  "자유전공학부(미래)",
  "경영학과",
  "글로벌한국학과",
  "영어영문학과",
  "상담심리학과",
  "유아교육과",
  "항공관광외국어학부",
  "사회복지학과",
  "음악학과",
  "아트앤디자인학과",
  "체육학과",
  "물리치료학과",
  "식품영양학과",
  "동물자원과학과",
  "바이오융합공학과",
  "화학생명과학과",
  "환경디자인원예학과",
  "인공지능융합학부",
  "컴퓨터공학부",
  "건축학과(5년제)",
  "건축학과(4년제)",
  "데이터클라우드공학과",
  "기타",
];

function makeBirthDate(year: string, month: string, day: string): string {
  if (!year || !month || !day) {
    return "";
  }
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export default function SignupPageFeature() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loginIdAvailable, setLoginIdAvailable] = useState<boolean | null>(
    null,
  );
  const [studentNoAvailable, setStudentNoAvailable] = useState<boolean | null>(
    null,
  );
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const passwordRule = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,20}$/;
  const passwordValid = passwordRule.test(form.password);
  const passwordMatched =
    form.password.length > 0 && form.password === form.passwordConfirm;

  const canSubmit = useMemo(
    () =>
      loginIdAvailable === true &&
      studentNoAvailable === true &&
      phoneAvailable === true &&
      emailVerified &&
      passwordValid &&
      passwordMatched &&
      form.department.length > 0 &&
      makeBirthDate(form.birthYear, form.birthMonth, form.birthDay).length > 0,
    [
      emailVerified,
      form.birthDay,
      form.birthMonth,
      form.birthYear,
      form.department,
      loginIdAvailable,
      passwordMatched,
      passwordValid,
      phoneAvailable,
      studentNoAvailable,
    ],
  );

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (key === "loginId") {
      setLoginIdAvailable(null);
    }
    if (key === "studentNo") {
      setStudentNoAvailable(null);
    }
    if (key === "email") {
      setEmailCodeSent(false);
      setEmailVerified(false);
    }
    if (key === "phone") {
      setPhoneAvailable(null);
    }
  };

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setProfileImage(nextFile);

    if (!nextFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(nextFile);
    setPreviewUrl(objectUrl);
  };

  const handleCheckLoginId = async () => {
    setErrorMessage("");
    try {
      const result = await checkLoginIdAvailability(form.loginId);
      setLoginIdAvailable(result.available);
    } catch {
      setErrorMessage("아이디 중복 확인에 실패했습니다.");
    }
  };

  const handleCheckStudentNo = async () => {
    setErrorMessage("");
    try {
      const result = await checkStudentNoAvailability(form.studentNo);
      setStudentNoAvailable(result.available);
    } catch {
      setErrorMessage("학번 중복 확인에 실패했습니다.");
    }
  };

  const handleCheckPhone = async () => {
    setErrorMessage("");
    try {
      const result = await checkPhoneAvailability(form.phone);
      setPhoneAvailable(result.available);
    } catch {
      setErrorMessage("전화번호 중복 확인에 실패했습니다.");
    }
  };

  const handleSendEmailCode = async () => {
    setErrorMessage("");
    setMessage("");
    try {
      const result = await sendEmailCode({
        email: form.email,
        purpose: "NEW_EMAIL",
      });
      setEmailCodeSent(result.ok);
      setMessage(result.message || "인증 코드를 전송했습니다.");
    } catch {
      setErrorMessage("인증 코드 전송에 실패했습니다.");
    }
  };

  const handleVerifyEmailCode = async () => {
    setErrorMessage("");
    setMessage("");
    try {
      const result = await verifyEmailCode({
        email: form.email,
        code: form.code,
      });
      setEmailVerified(result.ok);
      setMessage(
        result.message ||
          (result.ok
            ? "이메일 인증이 완료되었습니다."
            : "인증에 실패했습니다."),
      );
    } catch {
      setErrorMessage("인증 코드 확인에 실패했습니다.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");

    const birthDate = makeBirthDate(
      form.birthYear,
      form.birthMonth,
      form.birthDay,
    );
    if (!canSubmit || !birthDate) {
      setErrorMessage("필수 확인(중복/인증/비밀번호 확인)을 완료해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      let profileImageId: number | undefined;
      if (profileImage) {
        const uploadResult = await uploadProfileImage(profileImage);
        if (!uploadResult.ok) {
          setErrorMessage("프로필 이미지 업로드에 실패했습니다.");
          return;
        }
        profileImageId = uploadResult.profileImageId;
      }

      const result = await register({
        loginId: form.loginId,
        email: form.email,
        password: form.password,
        name: form.name,
        department: form.department,
        studentNo: form.studentNo,
        grade: Number(form.grade),
        enrollment: form.enrollment,
        birthDate,
        phone: form.phone,
        profileImageId,
      });
      setMessage(
        `회원가입이 완료되었습니다. (${result.userUuid}) 로그인 페이지로 이동해주세요.`,
      );
    } catch {
      setErrorMessage("회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto mt-27 w-full max-w-4xl pt-28">
      <Image
        className="pointer-events-none absolute left-1/2 top-20 z-0 -translate-x-1/2 -translate-y-1/2"
        src="/images/authLion.webp"
        alt="authLion"
        width={164}
        height={216}
        priority
      />

      <section className="relative z-10 rounded-t-[50px] bg-[linear-gradient(180deg,#484D5A_-23.29%,#303136_46.27%)] px-11 pb-9 pt-11">
        <div className="mb-6 flex items-center justify-between">
          <div />
          <h1 className="text-3xl font-bold text-foreground">회원가입</h1>
          <Link href="/auth" className="text-2xl text-gray-400">
            <Image
              src="/images/closeButton.webp"
              alt=""
              width={44}
              height={44}
              priority
            />
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-col gap-8 md:flex-row"
        >
          <div className="flex flex-col items-center pt-8 md:w-[170px] md:shrink-0">
            <p className="mb-3 text-base text-gray-3">프로필 사진</p>
            <div className="flex h-[147px] w-[147px] items-center justify-center overflow-hidden rounded-full border border-[#6f7583] bg-[#4a4f5a]">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="프로필 미리보기"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <Image
                  className="rounded-full object-cover"
                  src="/images/defaultProf.webp"
                  alt="기본 프로필"
                  width={147}
                  height={147}
                />
              )}
            </div>
            <label className="mt-3 inline-flex h-9 cursor-pointer items-center justify-center rounded bg-[#4b9cff] px-3 text-xs font-semibold text-white">
              이미지 선택
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                이름
              </label>
              <div className="min-w-0 flex-1">
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-10 w-full rounded bg-[#d9d9d9] px-3 text-sm text-black"
                  required
                />
              </div>
              <div className="hidden md:block md:w-[84px]" />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                학과
              </label>
              <div className="min-w-0 flex-1">
                <select
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  className="h-10 w-full rounded bg-[#d9d9d9] px-2 text-sm text-black"
                  required
                >
                  <option value="">학과 선택</option>
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden md:block md:w-[84px]" />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                학번
              </label>
              <div className="relative min-w-0 flex-1">
                <input
                  value={form.studentNo}
                  onChange={(e) => updateField("studentNo", e.target.value)}
                  className="h-10 w-full rounded bg-[#d9d9d9] px-3 pr-[86px] text-sm text-black md:pr-3"
                  required
                />
                <button
                  type="button"
                  onClick={handleCheckStudentNo}
                  className="absolute right-1 top-1 inline-flex h-8 items-center rounded bg-[#4b9cff] px-2 text-[11px] font-semibold text-white md:hidden"
                >
                  중복 확인
                </button>
              </div>
              <button
                type="button"
                onClick={handleCheckStudentNo}
                className="hidden h-9 rounded bg-[#4b9cff] px-2 text-xs font-semibold text-white md:inline-flex md:w-[84px] md:items-center md:justify-center"
              >
                중복 확인
              </button>
            </div>
            {studentNoAvailable !== null ? (
              <p
                className={`text-xs md:pl-[82px] ${studentNoAvailable ? "text-[#7ee787]" : "text-[#ff7b7b]"}`}
              >
                {studentNoAvailable
                  ? "사용 가능한 학번입니다."
                  : "이미 사용 중인 학번입니다."}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                학년
              </label>
              <div className="flex min-w-0 flex-1 gap-2">
                <select
                  value={form.grade}
                  onChange={(e) => updateField("grade", e.target.value)}
                  className="h-10 min-w-0 w-1/3 rounded bg-[#d9d9d9] px-3 text-sm text-black"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                <div className="h-10 min-w-0 w-1/3" />
                <div className="flex h-10 min-w-0 w-1/3 items-center justify-end gap-3 whitespace-nowrap text-sm text-gray-100">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="enrollment"
                      checked={form.enrollment === "ENROLLED"}
                      onChange={() => updateField("enrollment", "ENROLLED")}
                    />
                    재학
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="enrollment"
                      checked={form.enrollment !== "ENROLLED"}
                      onChange={() =>
                        updateField("enrollment", "LEAVE_OF_ABSENCE")
                      }
                    />
                    휴학
                  </label>
                </div>
              </div>
              <div className="hidden md:block md:w-[84px]" />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                생년월일
              </label>
              <div className="flex min-w-0 flex-1 gap-2">
                <input
                  value={form.birthYear}
                  onChange={(e) => updateField("birthYear", e.target.value)}
                  placeholder="연도"
                  className="h-10 min-w-0 w-1/3 rounded bg-[#d9d9d9] px-3 text-sm text-black"
                />
                <input
                  value={form.birthMonth}
                  onChange={(e) => updateField("birthMonth", e.target.value)}
                  placeholder="월"
                  className="h-10 min-w-0 w-1/3 rounded bg-[#d9d9d9] px-3 text-sm text-black"
                />
                <input
                  value={form.birthDay}
                  onChange={(e) => updateField("birthDay", e.target.value)}
                  placeholder="일"
                  className="h-10 min-w-0 w-1/3 rounded bg-[#d9d9d9] px-3 text-sm text-black"
                />
              </div>
              <div className="hidden md:block md:w-[84px]" />
            </div>

            <div className="mt-20 flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                전화번호
              </label>
              <div className="relative min-w-0 flex-1">
                <input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="h-10 w-full rounded bg-[#d9d9d9] px-3 pr-[86px] text-sm text-black md:pr-3"
                  required
                />
                <button
                  type="button"
                  onClick={handleCheckPhone}
                  className="absolute right-1 top-1 inline-flex h-8 items-center rounded bg-[#4b9cff] px-2 text-[11px] font-semibold text-white md:hidden"
                >
                  중복 확인
                </button>
              </div>
              <button
                type="button"
                onClick={handleCheckPhone}
                className="hidden h-9 rounded bg-[#4b9cff] px-2 text-xs font-semibold text-white md:inline-flex md:w-[84px] md:items-center md:justify-center"
              >
                중복 확인
              </button>
            </div>
            {phoneAvailable !== null ? (
              <p
                className={`text-xs md:pl-[82px] ${phoneAvailable ? "text-[#7ee787]" : "text-[#ff7b7b]"}`}
              >
                {phoneAvailable
                  ? "사용 가능한 전화번호입니다."
                  : "이미 사용 중인 전화번호입니다."}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                이메일
              </label>
              <div className="relative min-w-0 flex-1">
                <input
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="h-10 w-full rounded bg-[#d9d9d9] px-3 pr-[92px] text-sm text-black md:pr-3"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  className="absolute right-1 top-1 inline-flex h-8 items-center rounded bg-[#4b9cff] px-2 text-[11px] font-semibold text-white md:hidden"
                >
                  인증번호 전송
                </button>
              </div>
              <button
                type="button"
                onClick={handleSendEmailCode}
                className="hidden h-9 rounded bg-[#4b9cff] px-2 text-xs font-semibold text-white md:inline-flex md:w-[84px] md:items-center md:justify-center"
              >
                인증번호 전송
              </button>
            </div>
            {emailCodeSent ? (
              <p className="text-xs text-[#7ee787] md:pl-[82px]">
                인증번호가 전송되었습니다.
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                인증번호
              </label>
              <div className="relative min-w-0 flex-1">
                <input
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value)}
                  className="h-10 w-full rounded bg-[#d9d9d9] px-3 pr-[92px] text-sm text-black md:pr-3"
                />
                <button
                  type="button"
                  onClick={handleVerifyEmailCode}
                  disabled={!emailCodeSent}
                  className="absolute right-1 top-1 inline-flex h-8 items-center rounded bg-[#4b9cff] px-2 text-[11px] font-semibold text-white disabled:opacity-50 md:hidden"
                >
                  인증번호 확인
                </button>
              </div>
              <button
                type="button"
                onClick={handleVerifyEmailCode}
                disabled={!emailCodeSent}
                className="hidden h-9 rounded bg-[#4b9cff] px-2 text-xs font-semibold text-white disabled:opacity-50 md:inline-flex md:w-[84px] md:items-center md:justify-center"
              >
                인증번호 확인
              </button>
            </div>
            {emailVerified ? (
              <p className="text-xs text-[#7ee787] md:pl-[82px]">
                이메일 인증이 완료되었습니다.
              </p>
            ) : null}

            <div className="mt-20 flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                아이디
              </label>
              <div className="relative min-w-0 flex-1">
                <input
                  value={form.loginId}
                  onChange={(e) => updateField("loginId", e.target.value)}
                  className="h-10 w-full rounded bg-[#d9d9d9] px-3 pr-[86px] text-sm text-black md:pr-3"
                  required
                />
                <button
                  type="button"
                  onClick={handleCheckLoginId}
                  className="absolute right-1 top-1 inline-flex h-8 items-center rounded bg-[#4b9cff] px-2 text-[11px] font-semibold text-white md:hidden"
                >
                  중복 확인
                </button>
              </div>
              <button
                type="button"
                onClick={handleCheckLoginId}
                className="hidden h-9 rounded bg-[#4b9cff] px-2 text-xs font-semibold text-white md:inline-flex md:w-[84px] md:items-center md:justify-center"
              >
                중복 확인
              </button>
            </div>
            {loginIdAvailable !== null ? (
              <p
                className={`text-xs md:pl-[82px] ${loginIdAvailable ? "text-[#7ee787]" : "text-[#ff7b7b]"}`}
              >
                {loginIdAvailable
                  ? "사용 가능한 아이디입니다."
                  : "이미 사용 중인 아이디입니다."}
              </p>
            ) : null}
            <p className="text-xs text-gray-400 md:pl-[82px]">
              * 4~20자 영문, 숫자만 가능합니다.
            </p>

            <div className="flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                비밀번호
              </label>
              <div className="min-w-0 flex-1">
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="h-10 w-full rounded bg-[#d9d9d9] px-3 text-sm text-black"
                  required
                />
              </div>
              <div className="hidden md:block md:w-[84px]" />
            </div>
            <p className="text-xs text-gray-400 md:pl-[82px]">
              *8~20자 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.
            </p>
            {form.password.length > 0 ? (
              <p
                className={`text-xs md:pl-[82px] ${passwordValid ? "text-[#7ee787]" : "text-[#ff7b7b]"}`}
              >
                {passwordValid
                  ? "*사용 가능한 비밀번호 입니다."
                  : "*입력하신 비밀번호가 설정 기준에 부합하지 않습니다."}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <label className="w-[72px] shrink-0 whitespace-nowrap text-sm text-gray-100 md:w-20">
                비밀번호 확인
              </label>
              <div className="min-w-0 flex-1">
                <input
                  type="password"
                  value={form.passwordConfirm}
                  onChange={(e) =>
                    updateField("passwordConfirm", e.target.value)
                  }
                  className="h-10 w-full rounded bg-[#d9d9d9] px-3 text-sm text-black"
                  required
                />
              </div>
              <div className="hidden md:block md:w-[84px]" />
            </div>
            {!passwordMatched && form.passwordConfirm ? (
              <p className="text-xs text-[#ff7b7b]">
                비밀번호가 일치하지 않습니다.
              </p>
            ) : null}

            {message ? (
              <p className="text-sm text-[#7ee787]">{message}</p>
            ) : null}
            {errorMessage ? (
              <p className="text-sm text-[#ff7b7b]">{errorMessage}</p>
            ) : null}

            <div className="mt-6 flex items-center md:gap-2">
              <div className="hidden w-[72px] shrink-0 md:block md:w-20" />
              <div className="flex flex-1 justify-center md:justify-end">
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="h-11 min-w-[160px] rounded-md bg-main-1 px-8 text-xl font-bold text-white disabled:bg-gray-5"
                >
                  {isSubmitting ? "처리 중..." : "가입하기"}
                </button>
              </div>
              <div className="hidden md:block md:w-[84px]" />
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
