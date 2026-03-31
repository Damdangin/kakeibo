"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Transaction {
  id?: number;
  name: string;
  amount: number;
  date: string;
}

export default function KakeiboPage() {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [lastInputAmount, setLastInputAmount] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 【追加】MyPageで設定する予算（初期残高）の状態
  const [initialBalance, setInitialBalance] = useState<number>(0);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/transactions");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("データの取得に失敗しました:", err);
    }
  };

  useEffect(() => {
    fetchHistory();

    // 【重要】ブラウザの保存領域から「予算」を読み込む
    const savedBudget = localStorage.getItem("user_budget");
    if (savedBudget) {
      setInitialBalance(Number(savedBudget));
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayTotal = history.reduce((sum, item) => sum + item.amount, 0);

  // 日時表示用
  const month = currentTime.getMonth() + 1;
  const date = currentTime.getDate();
  const dayOfWeek = new Intl.DateTimeFormat("ja-JP", {
    weekday: "short",
  }).format(currentTime);
  const timeDisplay = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`;

  const openModal = () => {
    if (!itemName || !amount) return;
    setShowModal(true);
  };

  const handleConfirm = async () => {
    const currentAmount = Number(amount);
    const newTransaction = {
      name: itemName,
      amount: currentAmount,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await fetch("http://localhost:8000/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });

      if (res.ok) {
        fetchHistory();
        setLastInputAmount(currentAmount);
        setShowModal(false);
        setItemName("");
        setAmount("");
      }
    } catch (err) {
      alert("保存に失敗しました。");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100 p-4 md:p-12">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-200">
        {/* 左側：入力エリア */}
        <div className="bg-indigo-700 text-white p-10 md:w-5/12 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <span className="text-xs opacity-60 tracking-[0.2em] font-bold uppercase">
                Current Time
              </span>
              <p className="text-2xl font-bold mt-1 opacity-90 flex gap-2">
                <span>
                  {month}月{date}日 ({dayOfWeek})
                </span>
                <span>{timeDisplay}</span>
              </p>
            </div>

            <div className="space-y-8 mt-12">
              <div className="space-y-2">
                <label className="text-xs font-bold opacity-70 uppercase">
                  商品名
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-indigo-400 focus:border-white outline-none py-2 text-xl"
                  placeholder="何を買いましたか？"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold opacity-70 uppercase">
                  金額
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full bg-transparent border-b-2 border-indigo-400 focus:border-white outline-none py-2 text-xl"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="mt-12 bg-white text-indigo-700 py-4 px-8 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95"
          >
            入力内容を確認
          </button>
        </div>

        {/* 右側：数値表示 */}
        <div className="p-10 md:w-7/12 bg-white flex flex-col space-y-8">
          <div className="flex justify-end space-x-6 mb-4">
            <Link href="/">
              <button className="text-sm font-bold text-zinc-500 hover:text-indigo-600 py-2">
                ログアウト
              </button>
            </Link>
            <Link href="/mypage">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90">
                MyPage
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-3xl">
              <p className="text-indigo-900 font-bold">直近の入力額</p>
              <p className="text-3xl font-black text-indigo-600">
                ¥ {lastInputAmount.toLocaleString()}
              </p>
            </div>

            <div className="flex justify-between items-center bg-red-50 p-6 rounded-3xl">
              <p className="text-red-900 font-bold">今日使用した金額</p>
              <p className="text-3xl font-black text-red-500">
                ¥ {todayTotal.toLocaleString()}
              </p>
            </div>

            {/* ③ 現在の残高：initialBalance（予算）から支出を引く */}
            <div className="flex justify-between items-center bg-zinc-900 p-8 rounded-3xl shadow-xl">
              <p className="text-zinc-400 font-bold">現在の残高</p>
              <div className="text-right">
                <p className="text-4xl font-black text-white">
                  ¥ {(initialBalance - todayTotal).toLocaleString()}
                </p>
                {initialBalance === 0 && (
                  <p className="text-[10px] text-red-400 font-bold mt-1 tracking-tighter">
                    ※MyPageで予算を設定してください
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* バー表示：予算(initialBalance)に対する使用率 */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                Budget Usage
              </p>
              <p className="text-2xl font-black text-zinc-800">
                {initialBalance > 0
                  ? Math.round((todayTotal / initialBalance) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="w-full bg-zinc-100 h-6 rounded-full overflow-hidden p-1 border border-zinc-200">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${initialBalance > 0 ? Math.min((todayTotal / initialBalance) * 100, 100) : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 履歴エリア (省略せずに保持) */}
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] p-10 shadow-xl border border-zinc-100 mt-6">
        <h2 className="text-2xl font-black text-zinc-800 mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
          入力履歴
        </h2>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
          {history.length === 0 ? (
            <p className="text-zinc-400 text-center py-10 italic">
              記録がありません
            </p>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-zinc-100"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-400">
                    {item.date}
                  </span>
                  <span className="text-xl font-black text-zinc-800 mt-1">
                    商品名：{item.name}
                  </span>
                </div>
                <div className="mt-2 md:mt-0 font-black text-indigo-600 text-2xl">
                  金額：{item.amount.toLocaleString()}￥
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* モーダル (省略せずに保持) */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white p-10 rounded-[2rem] max-w-md w-full shadow-2xl text-zinc-800">
            <h2 className="text-3xl font-black mb-8">
              この内容で登録しますか？
            </h2>
            <div className="space-y-4 bg-zinc-50 p-6 rounded-2xl mb-10 text-lg">
              <div className="flex justify-between border-b pb-2">
                <span className="text-zinc-400">商品</span>
                <span className="font-bold">{itemName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-zinc-400">金額</span>
                <span className="font-bold">
                  ¥{Number(amount).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-zinc-200 text-zinc-600 py-4 rounded-2xl font-bold"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                className="bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
