"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

//APIから返ってくるデータの型
interface Transaction {
  id?: number;
  name: string;
  amount: number;
  date: string;
}

// export defaultは 一つだけ存在
// Reactコンポーネント
export default function KakeiboPage() {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState<number | "">(""); //type指定　TS
  const [lastInputAmount, setLastInputAmount] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  // リアルタイムな時間を保持するための状態
  const [currentTime, setCurrentTime] = useState(new Date());

  //バックエンドからデータ取得する(Read)
  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/transactions");
      const data = await res.json();
      // Python側のモデルと名前を合わせる必要があります（例: title -> name）
      setHistory(data);
    } catch (err) {
      console.error("データの取得に失敗しました:", err);
    }
  };

  // 1分ごとに時間を更新する（時計のように動かしたい場合）
  useEffect(() => {
    fetchHistory();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const initialBalance = 99999;
  const todayTotal = history.reduce((sum, item) => sum + item.amount, 0);

  // 日時フォーマットの準備
  const month = currentTime.getMonth() + 1;
  const date = currentTime.getDate();
  const dayOfWeek = new Intl.DateTimeFormat("ja-JP", {
    weekday: "short",
  }).format(currentTime);
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const fullDateDisplay = `${month}月${date}日 (${dayOfWeek})`;
  const timeDisplay = `${hours}:${minutes}`;

  // 確認ボタンを押した時：まずモーダルを出すだけ
  const openModal = () => {
    if (!itemName || !amount) return;
    setShowModal(true);
  };

  // モーダル内の「確認」を押した時：実際にデータを登録する
  const handleConfirm = async () => {
    const currentAmount = Number(amount);
    const newTransaction = {
      name: itemName, // バックエンドのschemas.pyで定義した名前に合わせる
      amount: currentAmount,
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    };

    try {
      const res = await fetch("http://localhost:8000/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });

      if (res.ok) {
        // 保存に成功したら一覧を再取得
        fetchHistory();
        setLastInputAmount(currentAmount);
        setShowModal(false);
        setItemName("");
        setAmount("");
      }
    } catch (err) {
      alert("保存に失敗しました。サーバーが起動しているか確認してください。");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100 p-4 md:p-12">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-200">
        {/* 【左側】：曜日 ＋ 入力エリア */}
        <div className="bg-indigo-700 text-white p-10 md:w-5/12 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <span className="text-xs opacity-60 tracking-[0.2em] font-bold uppercase">
                Current Time
              </span>
              {/* 月日(曜日)を表示 */}
              <p className="text-2xl font-bold mt-1 opacity-90 flex gap-2">
                <span>{fullDateDisplay}</span>
                <span>{timeDisplay}</span>
              </p>
              {/* 時:分 を大きく表示
              <h1 className="text-2xl font-black tracking-tighter mt-2">

              </h1> */}
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
                  className="w-full bg-transparent border-b-2 border-indigo-400 focus:border-white outline-none py-2 text-xl transition-colors"
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
                  className="w-full bg-transparent border-b-2 border-indigo-400 focus:border-white outline-none py-2 text-xl transition-colors"
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

        {/* 【右側】：数値表示 ＋ バー表示 */}
        <div className="p-10 md:w-7/12 bg-white flex flex-col  space-y-8">
          {/* 追加：ログイン・新規登録ボタンエリア */}
          <div className="flex justify-end space-x-6 mb-4">
            <Link href="/login">
              <button className="text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors py-2">
                ログイン
              </button>
            </Link>
            <Link href="/signup">
              <button className="bg-zinc-100 text-zinc-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all shadow-sm">
                新規ID登録
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* ① さっき入れた金額 */}
            <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-3xl">
              <p className="text-indigo-900 font-bold">直近の入力額</p>
              <p className="text-3xl font-black text-indigo-600">
                ¥ {lastInputAmount.toLocaleString()}
              </p>
            </div>

            {/* ② 今日使用した金額 */}
            <div className="flex justify-between items-center bg-red-50 p-6 rounded-3xl">
              <p className="text-red-900 font-bold">今日使用した金額</p>
              <p className="text-3xl font-black text-red-500">
                ¥ {todayTotal.toLocaleString()}
              </p>
            </div>

            {/* ③ 現時点の残高 */}
            <div className="flex justify-between items-center bg-zinc-900 p-8 rounded-3xl shadow-xl">
              <p className="text-zinc-400 font-bold">現在の残高</p>
              <p className="text-4xl font-black text-white">
                ¥ {(initialBalance - todayTotal).toLocaleString()}
              </p>
            </div>
          </div>

          {/* バー形式の支出割合 */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                Budget Usage
              </p>
              <p className="text-2xl font-black text-zinc-800">
                {Math.round((todayTotal / initialBalance) * 100)}%
              </p>
            </div>
            <div className="w-full bg-zinc-100 h-6 rounded-full overflow-hidden p-1 border border-zinc-200">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min((todayTotal / initialBalance) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 【新規追加】：入力履歴エリア */}
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] p-10 shadow-xl border border-zinc-100 mt-6">
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
                    {item.date}
                  </span>
                  <span className="text-xl font-black text-zinc-800 mt-1">
                    商品名：{item.name}
                  </span>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="text-2xl font-black text-indigo-600">
                    金額：{item.amount.toLocaleString()}￥
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* プロンプト：確認・キャンセルボタン付き */}
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
              <div className="flex justify-between border-b pb-2">
                <span className="text-zinc-400">金額</span>
                <span className="font-bold">
                  ¥{Number(amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">登録日時</span>
                <span className="font-bold">
                  {month}/{date} {timeDisplay}
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
