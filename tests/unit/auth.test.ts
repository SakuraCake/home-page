import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '~/server/utils/auth'

describe('Auth Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'test123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeTruthy()
      expect(hashedPassword.length).toBeGreaterThan(0)
      expect(hashedPassword).not.toBe(password)
    })
  })

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'test123'
      const hashedPassword = await hashPassword(password)
      const isVerified = await verifyPassword(password, hashedPassword)
      
      expect(isVerified).toBe(true)
    })

    it('should reject an incorrect password', async () => {
      const password = 'test123'
      const wrongPassword = 'wrong123'
      const hashedPassword = await hashPassword(password)
      const isVerified = await verifyPassword(wrongPassword, hashedPassword)
      
      expect(isVerified).toBe(false)
    })
  })
})
