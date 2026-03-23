"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // ページ遷移用

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // TODO: バックエンド /login API 呼び出し
    console.log("ログイン試行:", username);
    router.push("/"); // 成功したらメインへ
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md w-full border border-zinc-200">
        <h1 className="text-3xl font-black text-indigo-700 mb-8 text-center uppercase tracking-tighter">
          ログイン
        </h1>
        <div className="space-y-6">
          <input
            type="text"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border-b-2 border-zinc-200 p-3 outline-none focus:border-indigo-500 transition-colors text-black"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b-2 border-zinc-200 p-3 outline-none focus:border-indigo-500 transition-colors text-black"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
          >
            ログイン
          </button>
          <div className="text-center">
            <Link
              href="/signup"
              className="text-zinc-400 text-sm font-bold hover:text-indigo-500 transition-colors"
            >
              まだアカウントをお持ちでない方はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
