import { cycleSchema, loginSchema } from '../lib/validations'

describe('validations', () => {
  test('loginSchema rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'x', password: '123' })
    expect(result.success).toBe(false)
  })

  test('cycleSchema normalizes seconds to minutes', () => {
    const result = cycleSchema.parse({
      name: 'Focus',
      duration: 1500, // 25min em segundos
      phase: 'focus',
      completed: true
    })
    expect(result.duration).toBe(25)
  })
})

