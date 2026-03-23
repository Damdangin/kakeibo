"use client";
import React, { useState, useEffect } from "react";

export default function KakeiboPage() {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [lastInputAmount, setLastInputAmount] = useState<number>(0);
  // 履歴を保存する配列（最新のものが上に来るように管理します）
  const [history, setHistory] = useState<
    { name: string; price: number; time: string }[]
  >([]);
  const [showConfirmPanel, setShowConfirmPanel] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const initialBalance = 50000;
  const todayTotal = history.reduce((sum, item) => sum + item.price, 0);

  const month = currentTime.getMonth() + 1;
  const date = currentTime.getDate();
  const dayOfWeek = new Intl.DateTimeFormat("ja-JP", {
    weekday: "short",
  }).format(currentTime);
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");

  const handlePreview = () => {
    if (!itemName || !amount) return;
    setShowConfirmPanel(true);
  };

  const handleFinalConfirm = () => {
    const currentAmount = Number(amount);
    setLastInputAmount(currentAmount);

    // 新しいデータを「配列の先頭」に追加します ([新データ, ...旧データ])
    const newEntry = {
      name: itemName,
      price: currentAmount,
      time: `${currentTime.getFullYear()}年${month}月${date}日 ${hours}時${minutes}分`,
    };

    setHistory([newEntry, ...history]);
    setShowConfirmPanel(false);
    setItemName("");
    setAmount("");
  };

  return (
    <main className="min-h-screen bg-zinc-100 flex flex-col items-center p-4 md:p-12 gap-8 overflow-y-auto">
      {/* メインカード（前回と同じ） */}
      <div className="w-full max-w-6xl aspect-[16/9] bg-white shadow-2xl md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row border border-zinc-200 shrink-0">
        {/* 左側：入力（省略なし） */}
        <div className="md:w-1/2 bg-indigo-700 text-white p-12 flex flex-col justify-between">
          <div>
            <div className="space-y-1">
              <p className="text-2xl font-medium opacity-80">
                {month}月{date}日 ({dayOfWeek})
              </p>
              <h1 className="text-8xl font-black tracking-tighter">
                {hours}:{minutes}
              </h1>
            </div>
            <div className="mt-20 space-y-10">
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-indigo-400 focus:border-white outline-none py-3 text-2xl placeholder:opacity-30"
                placeholder="商品名"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full bg-transparent border-b-2 border-indigo-400 focus:border-white outline-none py-3 text-2xl placeholder:opacity-30"
                placeholder="金額"
              />
            </div>
          </div>
          <button
            onClick={handlePreview}
            className="w-full bg-white text-indigo-700 py-5 rounded-2xl font-black text-2xl hover:bg-indigo-50 shadow-xl active:scale-95"
          >
            入力内容を確認
          </button>
        </div>

        {/* 右側：表示（省略なし） */}
        <div className="md:w-1/2 bg-white p-12 flex flex-col">
          <div className="flex justify-end space-x-6 mb-8">
            <button className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              Login
            </button>
            <button className="px-6 py-2 bg-zinc-900 text-white rounded-full text-sm font-bold shadow-lg">
              Sign Up
            </button>
          </div>
          <div className="flex-grow flex flex-col justify-center space-y-6">
            <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-3xl">
              <p className="text-indigo-900 font-bold">直近の入力</p>
              <p className="text-4xl font-black text-indigo-600">
                ¥{lastInputAmount.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between items-center bg-red-50 p-6 rounded-3xl">
              <p className="text-red-900 font-bold">今日の支出</p>
              <p className="text-4xl font-black text-red-500">
                ¥{todayTotal.toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
              <p className="text-zinc-500 font-bold text-sm mb-1">現在の残高</p>
              <p className="text-5xl font-black italic tracking-tight">
                ¥{(initialBalance - todayTotal).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 【新規追加】：入力履歴エリア */}
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] p-10 shadow-xl border border-zinc-100">
        <h2 className="text-2xl font-black text-zinc-800 mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
          入力履歴
        </h2>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
          {history.length === 0 ? (
            <p className="text-zinc-400 text-center py-10 italic">
              まだ記録がありません。入力を開始しましょう！
            </p>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-indigo-200 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {item.time}
                  </span>
                  <span className="text-xl font-black text-zinc-800 mt-1">
                    商品名：{item.name}
                  </span>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="text-2xl font-black text-indigo-600">
                    金額：{item.price.toLocaleString()}￥
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 下部確認パネル（前回と同じ） */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-zinc-200 transition-transform duration-500 ease-in-out z-20 ${showConfirmPanel ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="max-w-6xl mx-auto p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap items-center gap-10">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase">
                Item
              </p>
              <p className="text-2xl font-bold">{itemName}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase">
                Price
              </p>
              <p className="text-2xl font-black text-indigo-600">
                ¥{Number(amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase">
                Time
              </p>
              <p className="text-2xl font-bold">
                {month}/{date} {hours}:{minutes}
              </p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowConfirmPanel(false)}
              className="flex-1 md:px-10 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-bold"
            >
              キャンセル
            </button>
            <button
              onClick={handleFinalConfirm}
              className="flex-1 md:px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
            >
              確定して登録
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
