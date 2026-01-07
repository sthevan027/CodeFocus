import { serializeCookie } from '../../../lib/cookies'
import { AUTH_COOKIE_NAME } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // Expira cookie
  res.setHeader(
    'Set-Cookie',
    serializeCookie(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(0)
    })
  )

  return res.status(200).json({ message: 'Logout realizado com sucesso' })
}

