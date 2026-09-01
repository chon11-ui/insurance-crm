'use server'

import { db } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

async function getPlannerId() {
  const sessionCookie = (await cookies()).get('__session')?.value
  if (!sessionCookie) throw new Error('Unauthorized')
  
  // Directly use the uid from the client cookie
  return sessionCookie
}

export async function getCustomers() {
  const plannerId = await getPlannerId()
  const snapshot = await db.collection('customers')
    .where('plannerId', '==', plannerId)
    .orderBy('createdAt', 'desc')
    .get()
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[]
}

export async function getCustomer(id: string) {
  const plannerId = await getPlannerId()
  const doc = await db.collection('customers').doc(id).get()
  
  if (!doc.exists) return null
  
  const data = doc.data()
  if (data?.plannerId !== plannerId) return null
  
  return { id: doc.id, ...data } as any
}

export async function createCustomer(data: any) {
  const plannerId = await getPlannerId()
  const docRef = await db.collection('customers').add({
    ...data,
    plannerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  revalidatePath('/')
  return { success: true, id: docRef.id }
}

export async function updateCustomer(id: string, data: any) {
  const plannerId = await getPlannerId()
  const docRef = db.collection('customers').doc(id)
  const doc = await docRef.get()
  
  if (!doc.exists || doc.data()?.plannerId !== plannerId) {
    throw new Error('Unauthorized')
  }

  await docRef.update({
    ...data,
    updatedAt: new Date().toISOString()
  })
  
  revalidatePath('/')
  revalidatePath(`/customers/${id}`)
  return { success: true }
}

export async function deleteCustomer(id: string) {
  const plannerId = await getPlannerId()
  const docRef = db.collection('customers').doc(id)
  const doc = await docRef.get()
  
  if (!doc.exists || doc.data()?.plannerId !== plannerId) {
    throw new Error('Unauthorized')
  }

  await docRef.delete()
  revalidatePath('/')
  return { success: true }
}
