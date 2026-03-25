'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './form.module.css'

const FOOD_OPTIONS = ['よく食べた', '普通', '少ない', '食べなかった']
const EXCRETION_OPTIONS = ['正常', '異常', 'なし']
const CONDITION_OPTIONS = ['良好', '普通', '不調']

type InitialValues = {
  weight?: string
  food_amount?: string
  excretion?: string
  condition?: string
  memo?: string
}

type Props = {
  mode: 'new' | 'edit'
  recordId?: string
  initial?: InitialValues
}

export default function RecordForm({ mode, recordId, initial = {} }: Props) {
  const router = useRouter()

  const [weight, setWeight] = useState(initial.weight ?? '')
  const [foodAmount, setFoodAmount] = useState(initial.food_amount ?? '')
  const [excretion, setExcretion] = useState(initial.excretion ?? '')
  const [condition, setCondition] = useState(initial.condition ?? '')
  const [memo, setMemo] = useState(initial.memo ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setSaving(true)
    setError('')

    const url = mode === 'new' ? '/api/records' : `/api/records/${recordId}`
    const method = mode === 'new' ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weight: weight ? Number(weight) : null,
        food_amount: foodAmount || null,
        excretion: excretion || null,
        condition: condition || null,
        memo: memo || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '保存に失敗しました')
      setSaving(false)
      return
    }

    router.push('/records')
    router.refresh()
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className={styles.form}>

      {/* 体重 */}
      <div className={styles.field}>
        <label className={styles.label}>体重（kg）</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className={styles.input}
          placeholder="例: 4.2"
        />
      </div>

      {/* 食事量 */}
      <div className={styles.field}>
        <label className={styles.label}>食事量</label>
        <div className={styles.radioGroup}>
          {FOOD_OPTIONS.map((opt) => (
            <label key={opt} className={styles.radioLabel}>
              <input
                type="radio"
                name="food_amount"
                value={opt}
                checked={foodAmount === opt}
                onChange={() => setFoodAmount(opt)}
                className={styles.radio}
              />
              {opt}
            </label>
          ))}
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="food_amount"
              value=""
              checked={foodAmount === ''}
              onChange={() => setFoodAmount('')}
              className={styles.radio}
            />
            未記入
          </label>
        </div>
      </div>

      {/* 排泄 */}
      <div className={styles.field}>
        <label className={styles.label}>排泄</label>
        <div className={styles.radioGroup}>
          {EXCRETION_OPTIONS.map((opt) => (
            <label key={opt} className={styles.radioLabel}>
              <input
                type="radio"
                name="excretion"
                value={opt}
                checked={excretion === opt}
                onChange={() => setExcretion(opt)}
                className={styles.radio}
              />
              {opt}
            </label>
          ))}
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="excretion"
              value=""
              checked={excretion === ''}
              onChange={() => setExcretion('')}
              className={styles.radio}
            />
            未記入
          </label>
        </div>
      </div>

      {/* 体調 */}
      <div className={styles.field}>
        <label className={styles.label}>体調</label>
        <div className={styles.radioGroup}>
          {CONDITION_OPTIONS.map((opt) => (
            <label key={opt} className={styles.radioLabel}>
              <input
                type="radio"
                name="condition"
                value={opt}
                checked={condition === opt}
                onChange={() => setCondition(opt)}
                className={styles.radio}
              />
              {opt}
            </label>
          ))}
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="condition"
              value=""
              checked={condition === ''}
              onChange={() => setCondition('')}
              className={styles.radio}
            />
            未記入
          </label>
        </div>
      </div>

      {/* メモ */}
      <div className={styles.field}>
        <label className={styles.label}>様子・メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className={styles.textarea}
          placeholder="気になったことや様子を記録しましょう"
          rows={4}
        />
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.push('/records')}
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
