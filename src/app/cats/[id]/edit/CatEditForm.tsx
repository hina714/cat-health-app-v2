'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Cropper, { Area } from 'react-easy-crop'
import styles from './page.module.css'

type Cat = {
  id: string
  name: string
  icon_data: string | null
}

type Props = {
  cat: Cat
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// キャンバスで切り抜き処理をして base64 JPEG を返す
async function cropToBase64(imageSrc: string, croppedAreaPixels: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 300
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        size,
        size
      )

      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    image.onerror = reject
  })
}

export default function CatEditForm({ cat }: Props) {
  const router = useRouter()

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [iconData, setIconData] = useState<string | null>(cat.icon_data)

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels)
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      setError('画像は10MB以下にしてください')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleCropConfirm() {
    if (!imageSrc || !croppedArea) return
    const base64 = await cropToBase64(imageSrc, croppedArea)
    setIconData(base64)
    setImageSrc(null)
  }

  async function handleSubmit() {
    setSaving(true)
    setError('')

    const res = await fetch(`/api/cats/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icon_data: iconData }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '保存に失敗しました')
      setSaving(false)
      return
    }

    router.push(`/cats/${cat.id}`)
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className={styles.form}>
      {/* アイコン写真 */}
      <section className={styles.iconSection}>
        <div className={styles.iconPreview}>
          {iconData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconData} alt="アイコン" className={styles.iconImg} />
          ) : (
            <span className={styles.iconDefault}>🐱</span>
          )}
        </div>
        <label className={styles.fileLabel}>
          {iconData ? '写真を変更する' : '写真を選ぶ'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </label>
      </section>

      {/* 画像エディタ */}
      {imageSrc && (
        <div className={styles.cropperContainer}>
          <div className={styles.cropperArea}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className={styles.zoomRow}>
            <span className={styles.zoomLabel}>ズーム</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className={styles.zoomSlider}
            />
          </div>
          <div className={styles.cropButtons}>
            <button type="button" onClick={() => setImageSrc(null)} className={styles.btnCancel}>
              キャンセル
            </button>
            <button type="button" onClick={handleCropConfirm} className={styles.btnPrimary}>
              この写真を使う
            </button>
          </div>
        </div>
      )}

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.push(`/cats/${cat.id}`)}
          className={styles.btnCancel}
        >
          キャンセル
        </button>
        <button type="submit" disabled={saving} className={styles.btnPrimary}>
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>
    </form>
  )
}
