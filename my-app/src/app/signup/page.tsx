"use client";
import React, { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  // --- ステート管理 ---
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // メール形式のバリデーション (Regex)
  const validateEmail = (emailStr: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailStr);
  };

  // メールアドレス入力時のハンドラー (Type: ChangeEvent)
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !validateEmail(value)) {
      setEmailError("有効なメール形式ではありません。");
    } else {
      setEmailError("");
    }
  };

  // 認証番号送信処理 (Async/Await)
  const handleSendEmail = async () => {
    if (!email || !validateEmail(email)) {
      alert("有効なメールアドレスを入力してください。");
      return;
    }

    try {
      // 1. サーバーへ認証番号の送信リクエスト (FastAPI)
      const response = await fetch("http://localhost:8000/auth/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        // 2. 送信成功時の処理
        setIsEmailSent(true);
        alert("認証番号を送信しました。メールを確認してください。");
      } else {
        // 3. サーバーエラー（重複、ドメイン不正など）の処理
        const errorData = await response.json();
        alert(errorData.detail || "送信に失敗しました。");
      }
    } catch (error) {
      // ネットワークエラーなどの例外処理
      alert("ネットワークエラーが発生しました。接続を確認してください。");
    }
  };

  // 新規登録実行処理
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("パスワードが一致しません。");
      return;
    }
    // TODO: バックエンド /signup API 呼び出し
    alert("登録に成功しました！ログインしてください。");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6 text-black">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md w-full border border-zinc-200">
        <h1 className="text-3xl font-black text-indigo-700 mb-8 text-center uppercase tracking-tighter">
          新規ID登録
        </h1>

        <div className="space-y-6">
          {/* Email入力エリア */}
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
                  onChange={handleEmailChange} // 正しくハンドラーを接続
                  className={`w-full border-b-2 p-3 outline-none transition-colors text-black ${
                    emailError
                      ? "border-red-500"
                      : "border-zinc-200 focus:border-indigo-500"
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={!!emailError || !email} // エラー時は無効化
                className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors h-[46px] disabled:opacity-50"
              >
                {isEmailSent ? "再送" : "認証番号を送信"}
              </button>
            </div>
            {/* エラーメッセージ表示 */}
            {emailError && (
              <p className="text-red-500 text-[10px] ml-1">{emailError}</p>
            )}
          </div>

          {/* 認証番号入力 */}
          <input
            type="text"
            placeholder="認証番号 (6桁)"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full border-b-2 border-zinc-200 p-3 outline-none focus:border-indigo-500 transition-colors"
          />

          {/* パ스워드 입력 */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* パスワード確認 */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // パスワード表示切替と同期
              placeholder="パスワード確認"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full border-b-2 p-3 outline-none transition-colors ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-500"
                  : "border-zinc-200 focus:border-indigo-500"
              }`}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                パスワードが一致しません。
              </p>
            )}
          </div>

          <button
            onClick={handleSignup}
            disabled={
              !email ||
              !!emailError ||
              !verificationCode ||
              !password ||
              password !== confirmPassword
            }
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
