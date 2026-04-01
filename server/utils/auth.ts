import { hash, compare } from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash)
}

export async function generateToken(userId: number): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: number }
  } catch {
    return null
  }
}
