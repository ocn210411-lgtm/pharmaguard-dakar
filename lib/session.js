import { getIronSession } from 'iron-session'

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'pharmaguard_secret_key_must_be_32_chars_min!!',
  cookieName: 'pharmaguard_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 8 * 60 * 60, // 8 heures
  },
}

export async function getSession(req, res) {
  return getIronSession(req, res, sessionOptions)
}
