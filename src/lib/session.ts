import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'session'

// JWTのペイロード（中身）の型定義
export type SessionPayload = {
  userId: string
}

// 環境変数からシークレットキーをバイト列に変換
function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET が設定されていません')
  return new TextEncoder().encode(secret)
}

// JWTを生成する関数
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

// JWTを検証する関数（失敗時は null を返す）
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      userId: payload.userId as string,
    }
  } catch {
    return null
  }
}
