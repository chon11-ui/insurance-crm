'use server'

import { db } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'

export async function getCustomers(query: string = '') {
  try {
    const snapshot = await db.collection('customers').orderBy('createdAt', 'desc').get()
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
    
    if (query) {
      return customers.filter(c => c.name.includes(query) || c.phone.includes(query))
    }
    return customers
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getCustomer(id: string) {
  try {
    const doc = await db.collection('customers').doc(id).get()
    if (!doc.exists) return null

    const customer = { id: doc.id, ...doc.data() } as any

    const [famSnap, conSnap, touchSnap] = await Promise.all([
      db.collection('customers').doc(id).collection('familyMembers').get(),
      db.collection('customers').doc(id).collection('contracts').get(),
      db.collection('customers').doc(id).collection('touchHistories').orderBy('date', 'desc').get(),
    ])

    customer.familyMembers = famSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    customer.contracts = conSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    customer.touchHistories = touchSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Convert dates
    customer.createdAt = customer.createdAt?.toDate() || new Date()
    customer.contracts = customer.contracts.map((c: any) => ({ ...c, contractDate: c.contractDate?.toDate() || null }))
    customer.touchHistories = customer.touchHistories.map((t: any) => ({ ...t, date: t.date?.toDate() || new Date() }))

    return customer
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function createCustomer(data: any) {
  const ref = await db.collection('customers').add({
    name: data.name,
    phone: data.phone,
    address: data.address,
    createdAt: new Date(),
  })
  revalidatePath('/')
  return { id: ref.id }
}

export async function deleteCustomer(id: string) {
  await db.collection('customers').doc(id).delete()
  revalidatePath('/')
}

export async function addTouchHistory(customerId: string, data: { type: string, description: string, date: Date }) {
  await db.collection('customers').doc(customerId).collection('touchHistories').add({
    type: data.type,
    description: data.description,
    date: data.date,
    createdAt: new Date()
  })
  revalidatePath(`/customers/${customerId}`)
}

export async function addContract(customerId: string, data: any) {
  await db.collection('customers').doc(customerId).collection('contracts').add({
    company: data.company,
    productName: data.productName,
    premium: parseInt(data.premium) || 0,
    status: data.status,
    contractDate: data.contractDate ? new Date(data.contractDate) : null,
    createdAt: new Date()
  })
  revalidatePath(`/customers/${customerId}`)
}

export async function addFamilyMember(customerId: string, data: any) {
  await db.collection('customers').doc(customerId).collection('familyMembers').add({
    name: data.name,
    relation: data.relation,
    phone: data.phone,
    createdAt: new Date()
  })
  revalidatePath(`/customers/${customerId}`)
}
