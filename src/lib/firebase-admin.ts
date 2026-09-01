import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

let adminInitError = ''

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
      // Remove leading/trailing quotes if they exist (common Netlify .env import issue)
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1)
      }
      if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
        privateKey = privateKey.slice(1, -1)
      }
      
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey,
        })
      })
    } else {
      initializeApp({ projectId: 'demo-project' })
    }
  } catch (error: any) {
    adminInitError = error.message || String(error)
    console.error('Firebase Admin initialization error', error)
  }
}

export const getAdminInitError = () => adminInitError

let dbInstance: FirebaseFirestore.Firestore | null = null
try {
  dbInstance = getFirestore()
} catch (e) {}

export const db = dbInstance as FirebaseFirestore.Firestore
