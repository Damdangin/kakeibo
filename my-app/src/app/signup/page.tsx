"use client";
import React, { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  // --- 스테이트 관리 ---
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // 인증 성공 여부 추가

  const validateEmail = (emailStr: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailStr);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("有効なメール形式ではありません。");
    } else {
      setEmailError("");
    }
  };

  // 1. 인증번호 발송 처리
  const handleSendEmail = async () => {
    if (!email || !validateEmail(email)) {
      alert("有効なメールアドレスを入力してください。");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        setIsEmailSent(true);
        alert("認証번호를 전송했습니다. 메일을 확인해주세요.");
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "전송에 실패했습니다.");
      }
    } catch (error) {
      alert("네트워크 에러가 발생했습니다.");
    }
  };

  // 2. 인증번호 검증 처리 (추가된 로직)
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          verification_code: verificationCode,
        }),
      });

      if (response.ok) {
        setIsVerified(true);
        alert("인증에 성공했습니다.");
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "인증번호가 일치하지 않습니다.");
      }
    } catch (error) {
      alert("인증 처리 중 오류가 발생했습니다.");
    }
  };

  // 3. 최종 회원가입 실행
  const handleSignup = async () => {
    if (!isVerified) {
      alert("먼저 이메일 인증을 완료해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          verification_code: verificationCode, // 백엔드 최종 검증용
        }),
      });

      if (response.ok) {
        alert("등록에 성공했습니다! 로그인해주세요.");
        router.push("/login");
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "가입에 실패했습니다.");
      }
    } catch (error) {
      alert("가입 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6 text-black">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md w-full border border-zinc-200">
        <h1 className="text-3xl font-black text-indigo-700 mb-8 text-center uppercase tracking-tighter">
          新規ID登録
        </h1>

        <div className="space-y-6">
          {/* Email 입력 영역 */}
          <div className="flex flex-col space-y-1">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-bold text-indigo-600 ml-1">
                  ID (メールアドレス)
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isVerified} // 인증 완료 시 수정 불가
                  className={`w-full border-b-2 p-3 outline-none transition-colors text-black ${
                    emailError
                      ? "border-red-500"
                      : "border-zinc-200 focus:border-indigo-500"
                  } ${isVerified ? "bg-zinc-50 text-zinc-400" : ""}`}
                />
              </div>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={!!emailError || !email || isVerified}
                className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors h-[46px] disabled:opacity-50"
              >
                {isEmailSent ? "再送" : "認証番号を送信"}
              </button>
            </div>
          </div>

          {/* 인증번호 입력 & 확인 버튼 영역 */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-indigo-600 ml-1">
              認証番号
            </label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="6桁の番号を入力"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isVerified} // 인증 완료 시 수정 불가
                  className={`w-full border-b-2 p-3 outline-none transition-colors ${
                    isVerified
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-zinc-200 focus:border-indigo-500"
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={!isEmailSent || isVerified || !verificationCode}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all h-[46px] min-w-[80px] ${
                  isVerified
                    ? "bg-green-500 text-white cursor-default"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-30"
                }`}
              >
                {isVerified ? "認証済み" : "認証する"}
              </button>
            </div>
            {!isEmailSent && !isVerified && (
              <p className="text-zinc-400 text-[10px] ml-1">
                まずIDの認証番号送信を押してください。
              </p>
            )}
          </div>

          {/* 패스워드 입력 영역 (인증 완료 후에만 활성화 권장) */}
          <div
            className={`space-y-6 transition-opacity ${isVerified ? "opacity-100" : "opacity-30 pointer-events-none"}`}
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!isVerified}
                className="w-full border-b-2 border-zinc-200 p-3 pr-12 outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-xs font-bold text-zinc-400 hover:text-indigo-500"
              >
                {showPassword ? "非表示" : "表示"}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="パスワード確認"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!isVerified}
                className={`w-full border-b-2 p-3 outline-none transition-colors ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-500"
                    : "border-zinc-200 focus:border-indigo-500"
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={!isVerified || !password || password !== confirmPassword}
            className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-zinc-900 active:scale-95 transition-all disabled:opacity-50"
          >
            新規ID登録
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-zinc-400 text-sm font-bold hover:text-indigo-500 transition-colors"
            >
              すでにアカウントをお持ちの方はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
