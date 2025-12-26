import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m'

/**
 * Gera hash da senha
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

/**
 * Verifica se a senha está correta
 */
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Cria token JWT
 */
export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

/**
 * Verifica e decodifica token JWT
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Extrai token do header Authorization
 */
export function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Middleware para verificar autenticação
 */
export async function requireAuth(req) {
  const token = getTokenFromRequest(req)
  if (!token) {
    throw new Error('Token não fornecido')
  }

  const decoded = verifyToken(token)
  if (!decoded || !decoded.userId) {
    throw new Error('Token inválido')
  }

  return decoded.userId
}

