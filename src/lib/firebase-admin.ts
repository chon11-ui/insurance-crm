import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  try {
    // 만약 환경 변수가 다 셋팅되어 있다면 그걸 사용하고,
    // 안되어 있으면(로컬 테스트) 기본적으로 초기화합니다.
    if (process.env.FIREBASE_PROJECT_ID) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
      })
    } else {
      // 로컬 개발 환경에서 키가 없더라도 에러 없이 껍데기만이라도 띄우기 위함
      initializeApp({ projectId: 'demo-project' })
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error)
  }
}

export const db = getFirestore()
