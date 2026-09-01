import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    const expiresIn = 60 * 60 * 24 * 5 * 1000
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn })
    
    ;(await cookies()).set('__session', sessionCookie, { 
      maxAge: expiresIn, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Session creation failed', error)
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 })
  }
}
