'use client'
// ↑ ブラウザ側で動くコンポーネントにする宣言

import { useState } from 'react'
// useState: 画面に表示するデータを管理する仕組み

export default function TestPage() {
  // result: GETで取得したデータを入れる箱（最初は null = 何もない）
  const [result, setResult] = useState<string | null>(null)

  // message: 入力フォームの文字を管理する箱
  const [message, setMessage] = useState('')

  // GETボタンを押したときに実行される関数
  async function handleGet() {
    const res = await fetch('/api/test')
    const data = await res.json()
    setResult(JSON.stringify(data, null, 2))
  }

  // 追加ボタンを押したときに実行される関数
  async function handlePost() {
    // 入力欄が空なら送信しない
    if (!message) {
      setResult('エラー: メッセージを入力してください')
      return
    }

    const res = await fetch('/api/test', {
      // POST = データを送信するリクエストの種類
      method: 'POST',
      // JSON形式で送ることをサーバーに伝える
      headers: { 'Content-Type': 'application/json' },
      // message の値をJSON文字列に変換して送る
      body: JSON.stringify({ message }),
    })
    const data = await res.json()
    setResult(JSON.stringify(data, null, 2))
    // 送信後に入力欄を空にする
    setMessage('')
  }

  return (
    <div>
      <h1>接続確認</h1>

      {/* データ取得エリア */}
      <button onClick={handleGet}>一覧を取得</button>

      {/* データ追加エリア */}
      <div>
        <input
          type="text"
          value={message}
          // 入力するたびに message を更新する
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力"
        />
        <button onClick={handlePost}>追加</button>
      </div>

      {/* result に値があれば表示する */}
      {result && <pre>{result}</pre>}
    </div>
  )
}
