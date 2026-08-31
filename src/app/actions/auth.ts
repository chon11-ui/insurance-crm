'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// 기본 비밀번호: 1234 (환경변수 APP_PASSWORD 로 변경 가능)
const APP_PASSWORD = process.env.APP_PASSWORD || '1234'

export async function verifyPassword(password: string) {
  if (password === APP_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('crm_auth', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30일 유지
      path: '/'
    })
    return true
  }
  return false
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('crm_auth')
  redirect('/login')
}
