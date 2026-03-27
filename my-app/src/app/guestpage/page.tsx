"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Transaction {
  id?: number;
  name: string;
  amount: number;
  date: string;
}

export default function GuestKakeiboPage() {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [lastInputAmount, setLastInputAmount] = useState<number>(0);
  // ゲスト用：APIではなく、このuseState内だけで履歴を管理する
  const [history, setHistory] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ゲストページなので、起動時のfetchHistory（DB取得）は行わない
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [isBalanceSet, setIsBalanceSet] = useState(false); // 残高が入力されたか
  const [tempBalance, setTempBalance] = useState<number | "">(""); // 入力中の一次保持

  const todayTotal = history.reduce((sum, item) => sum + item.amount, 0);

  // 日時フォーマット
  const month = currentTime.getMonth() + 1;
  const date = currentTime.getDate();
  const dayOfWeek = new Intl.DateTimeFormat("ja-JP", {
    weekday: "short",
  }).format(currentTime);
  const timeDisplay = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`;

  // 残高を確定させる関数
  const handleSetBalance = () => {
    if (tempBalance === "" || tempBalance < 0) {
      alert("有効な予算額を入力してください。");
      return;
    }
    setInitialBalance(Number(tempBalance));
    setIsBalanceSet(true);
  };

  const openModal = () => {
    if (!itemName || !amount) return;
    setShowModal(true);
  };

  // ゲスト用：DBには保存せず、historyステートに追加するだけ
  const handleConfirm = () => {
    const currentAmount = Number(amount);
    const newTransaction: Transaction = {
      name: itemName,
      amount: currentAmount,
      date: new Date().toLocaleDateString("ja-JP"), // 今日付
    };

    // 履歴の先頭に追加
    setHistory([newTransaction, ...history]);
    setLastInputAmount(currentAmount);

    // 入力欄をリセット
    setItemName("");
    setAmount("");
    setShowModal(false);
  };

  return (
    <main className="min-h-screen bg-zinc-100 p-4 md:p-12 text-black">
      {/* ゲスト用バナー（自分がゲストだと分かるように） */}
      <div className="max-w-6xl mx-auto mb-4 bg-amber-100 border border-amber-200 p-3 rounded-2xl text-center">
        <p className="text-amber-800 text-sm font-bold">
          ⚠️ 現在は **ゲストモード**
          です。ブラウザを閉じると記録は消去されます。
          <Link href="/signup" className="ml-2 underline text-indigo-600">
            保存するには会員登録してください
          </Link>
        </p>
      </div>

      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-200">
        {/* 【左側】：入力エリア */}
        <div className="bg-zinc-800 text-white p-10 md:w-5/12 flex flex-col justify-between">
          {!isBalanceSet ? (
            /* --- 予算設定前：残高入力画面 --- */
            <div className="flex flex-col justify-center h-full space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-3xl font-black mb-2">予算を設定</h2>
                <p className="text-zinc-400 text-sm">
                  まず最初に、今月使える予算（初期残高）を入力してください。
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold opacity-70 uppercase tracking-widest">
                  Initial Balance
                </label>
                <input
                  type="number"
                  value={tempBalance}
                  onChange={(e) =>
                    setTempBalance(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full bg-transparent border-b-2 border-indigo-500 outline-none py-4 text-4xl font-black transition-colors"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSetBalance}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl"
              >
                予算を確定して始める
              </button>
            </div>
          ) : (
            /* --- 予算設定後：通常の入力画面 --- */
            <div className="animate-in slide-in-from-left duration-500">
              <div className="mb-8">
                <span className="text-xs opacity-60 font-bold uppercase tracking-widest">
                  Guest Session
                </span>
                <p className="text-2xl font-bold mt-1 opacity-90">
                  {month}月{date}日 ({dayOfWeek}) {timeDisplay}
                </p>
              </div>

              <div className="space-y-8 mt-12">
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-70">商品名</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-zinc-600 focus:border-white outline-none py-2 text-xl transition-colors"
                    placeholder="何を買いましたか？"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-70">金額</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                      setAmount(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="w-full bg-transparent border-b-2 border-zinc-600 focus:border-white outline-none py-2 text-xl transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                onClick={openModal}
                className="mt-12 w-full bg-white text-zinc-900 py-4 px-8 rounded-2xl font-black text-xl hover:bg-zinc-100 transition-all shadow-xl active:scale-95"
              >
                入力内容を確認
              </button>
              <button
                onClick={() => setIsBalanceSet(false)}
                className="mt-4 w-full text-zinc-500 text-xs font-bold hover:text-white transition-colors"
              >
                予算を再設定する
              </button>
            </div>
          )}
        </div>

        {/* 【右側】：数値表示 */}
        <div className="p-10 md:w-7/12 bg-white flex flex-col space-y-8">
          <div className="flex justify-end space-x-6 mb-4">
            <Link
              href="/login"
              className="text-sm font-bold text-zinc-500 hover:text-indigo-600"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-sm"
            >
              新規ID登録
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
              <p className="text-zinc-500 font-bold">直近の入力額</p>
              <p className="text-3xl font-black text-zinc-800">
                ¥ {lastInputAmount.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between items-center bg-red-50 p-6 rounded-3xl">
              <p className="text-red-900 font-bold">今日使用した金額</p>
              <p className="text-3xl font-black text-red-500">
                ¥ {todayTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between items-center bg-indigo-600 p-8 rounded-3xl shadow-xl text-white">
              <p className="opacity-80 font-bold">現在の残高</p>
              <p className="text-4xl font-black">
                ¥ {(initialBalance - todayTotal).toLocaleString()}
              </p>
            </div>
          </div>

          {/* バー表示 */}
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

      {/* 入力履歴エリア */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-[2.5rem] p-10 shadow-xl border border-zinc-100 mt-6">
        <h2 className="text-2xl font-black text-zinc-800 mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-zinc-800 rounded-full"></span>
          一時的な記録 (履歴)
        </h2>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
          {history.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
              <p className="text-zinc-400 font-bold">まだ記録がありません。</p>
              <p className="text-zinc-400 text-xs">
                商品名と金額を入力してみましょう！
              </p>
            </div>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="flex justify-between p-5 bg-zinc-50 rounded-2xl border border-zinc-100"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-400">
                    {item.date}
                  </span>
                  <span className="text-xl font-black text-zinc-800">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-black text-indigo-600">
                    ¥ {item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white p-10 rounded-[2rem] max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-black text-zinc-800 mb-8">
              この内容で登録しますか？
            </h2>
            <div className="space-y-4 bg-zinc-50 p-6 rounded-2xl mb-10 text-lg">
              <div className="flex justify-between border-b pb-2">
                <span className="text-zinc-400">商品</span>
                <span className="font-bold">{itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">金額</span>
                <span className="font-bold">
                  ¥ {Number(amount).toLocaleString()}
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
                className="bg-zinc-900 text-white py-4 rounded-2xl font-black shadow-lg"
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
