"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    // TODO: バックエンド /signup API 呼び出し
    alert("登録に成功しました！ログインしてください。");
    router.push("/login"); // 登録後はログイン画面へ
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md w-full border border-zinc-200">
        <h1 className="text-3xl font-black text-indigo-700 mb-8 text-center uppercase tracking-tighter">
          新規ID登録
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
            onClick={handleSignup}
            className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-zinc-900 active:scale-95 transition-all"
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
