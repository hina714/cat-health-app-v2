'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AvatarEditor, { type AvatarEditorRef } from 'react-avatar-editor'
import styles from './page.module.css'

export default function NewCatPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  // AvatarEditor への参照（getImageScaledToCanvas() で編集後の画像を取得する）
  const editorRef = useRef<AvatarEditorRef>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [zoom, setZoom] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('画像は 10MB 以下にしてください')
      return
    }

    setError(null)
    setZoom(1)
    setSelectedFile(file)
  }

  function handleRemove() {
    setSelectedFile(null)
    setZoom(1)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const breed = formData.get('breed') as string
    const birthdate = formData.get('birthdate') as string

    // 写真が選ばれていれば、エディタから編集後の画像を base64 で取得
    let iconData: string | null = null
    if (selectedFile && editorRef.current) {
      // getImageScaledToCanvas: 表示サイズに合わせてトリミング・リサイズされた canvas を返す
      iconData = editorRef.current.getImageScaledToCanvas().toDataURL('image/jpeg', 0.85)
    }

    const res = await fetch('/api/cats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        icon_data: iconData,
        breed: breed || undefined,
        birthdate: birthdate || undefined,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      const msg = data.detail ? `${data.error}: ${data.detail}` : (data.error ?? '登録に失敗しました')
      setError(msg)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>猫を登録する</h1>

        {/* アイコン選択・編集エリア */}
        <div className={styles.iconArea}>
          {selectedFile ? (
            <div className={styles.editorWrapper}>
              {/* ドラッグで位置調整、スライダーでズーム調整できるエディタ */}
              <div className={styles.editorCanvas}>
                <AvatarEditor
                  ref={editorRef}
                  image={selectedFile}
                  width={180}
                  height={180}
                  borderRadius={90}
                  border={20}
                  color={[253, 244, 248, 0.7]}
                  scale={zoom}
                />
              </div>
              <div className={styles.sliderRow}>
                <span className={styles.sliderIcon}>🔍</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="ズーム"
                />
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className={styles.removeButton}
              >
                写真を変更する
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className={styles.uploadIcon}>📷</span>
              <span className={styles.uploadText}>写真を追加</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            名前<span className={styles.required}>*</span>
            <input
              type="text"
              name="name"
              required
              placeholder="例：たま"
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            品種
            <input
              type="text"
              name="breed"
              placeholder="例：アメリカンショートヘア"
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            誕生日
            <input
              type="date"
              name="birthdate"
              className={styles.input}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}
