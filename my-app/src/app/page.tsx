"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  // --- ステート管理 ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError(""); // 以前のエラーをクリア
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email, // ← ここがバックエンドの変数名と合っているか確認！
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("ログインに成功しました！");
        router.push("/main");
      } else {
        // 422エラーなどの複雑な構造を文字列に変換
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "入力内容が正しくありません（形式エラー）";
        setError(detail);
      }
    } catch (err) {
      setError("サーバーに接続できませんでした。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6 text-black">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md w-full border border-zinc-200">
        <h1 className="text-3xl font-black text-indigo-700 mb-8 text-center uppercase tracking-tighter">
          ログイン
        </h1>

        <div className="space-y-6">
          {/* Email入力 */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-indigo-600 ml-1">
              ID (メールアドレス)
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b-2 border-zinc-200 p-3 outline-none focus:border-indigo-500 transition-colors text-black"
            />
          </div>

          {/* Password入力 */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-indigo-600 ml-1">
              パスワード
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b-2 border-zinc-200 p-3 pr-12 outline-none focus:border-indigo-500 transition-colors text-black"
              />
              {/* <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-xs font-bold text-zinc-400 hover:text-indigo-500"
              >
                {showPassword ? "非表示" : "表示"}
              </button> */}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          {/* ログインボタン */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? "認証中..." : "ログイン"}
          </button>

          <hr className="border-zinc-100" />

          {/* リンクエリア */}
          <div className="flex flex-col space-y-4 text-center mt-4">
            <Link
              href="/guestpage" // 現在の家計簿メインページ（page.tsx）へのパス
              className="text-indigo-500 text-sm font-bold hover:underline"
            >
              ゲストユーザーとして利用する (Guest User)
            </Link>

            <Link
              href="/signup"
              className="text-zinc-400 text-sm font-bold hover:text-indigo-500 transition-colors"
            >
              IDがない方はこちら（新規登録）
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
