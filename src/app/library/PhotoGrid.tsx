'use client'

import { useState } from 'react'
import styles from './page.module.css'

type PhotoItem = {
  image_data: string
  username: string
  caption: string | null
  source: 'record' | 'comment'
}

type Props = {
  photos: PhotoItem[]
}

export default function PhotoGrid({ photos }: Props) {
  const [selected, setSelected] = useState<PhotoItem | null>(null)

  return (
    <>
      <div className={styles.grid}>
        {photos.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={p.image_data}
            alt={p.caption ?? '写真'}
            className={styles.thumb}
            onClick={() => setSelected(p)}
          />
        ))}
      </div>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.lightbox} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.image_data} alt={selected.caption ?? '写真'} className={styles.lightboxImg} />
            <div className={styles.lightboxMeta}>
              <span className={styles.lightboxUser}>{selected.username}</span>
              {selected.caption && <p className={styles.lightboxCaption}>{selected.caption}</p>}
              <span className={styles.lightboxSource}>
                {selected.source === 'comment' ? 'コメントより' : '記録より'}
              </span>
            </div>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
          </div>
        </div>
      )}
    </>
  )
}
