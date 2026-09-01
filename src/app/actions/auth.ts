'use server'

import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import '@/lib/firebase-admin'

export async function createSession(idToken: string) {
  const { getAdminInitError } = require('../../lib/firebase-admin')
  if (getAdminInitError()) return { success: false, error: 'Admin Init Failed: ' + getAdminInitError() }
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn })
    
    ;(await cookies()).set('__session', sessionCookie, { 
      maxAge: expiresIn, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    })
    
    return { success: true }
  } catch (error) {
    console.error('Session creation failed', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function removeSession() {
  ;(await cookies()).delete('__session')
}
