"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function MyPage() {
  const [budget, setBudget] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedBudget = localStorage.getItem("user_budget");
    if (savedBudget) {
      setBudget(Number(savedBudget));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("user_budget", budget.toString());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <main className="min-h-screen bg-zinc-100 p-4 md:p-12 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-gray-200 transition-all">
        <div className="bg-indigo-700 text-white p-12 text-center">
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            Account Settings
          </h1>
          <p className="opacity-70 font-medium">
            予算やプロフィールを管理しましょう
          </p>
        </div>

        <div className="p-12 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
              <label className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                今月の予算（初期残高）
              </label>
            </div>

            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-indigo-300 group-focus-within:text-indigo-600 transition-colors">
                ¥
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-indigo-500 focus:bg-white outline-none py-6 pl-16 pr-6 text-3xl font-black rounded-[2rem] transition-all"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-zinc-400 font-bold ml-2">
              ※ メイン画面の残高計算に使用されます。
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleSave}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 hover:shadow-indigo-200 shadow-xl active:scale-[0.98] transition-all"
            >
              設定を保存する
            </button>

            <Link
              href="/main"
              className="w-full text-center py-3 text-zinc-400 font-bold hover:text-indigo-600 transition-colors"
            >
              メイン画面に戻る
            </Link>
          </div>

          {isSaved && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl animate-bounce">
              ✅ 設定を更新しました！
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
