'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'

export default function FamilyForm({ customerId }: { customerId: string }) {
  const [family, setFamily] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFamily = async () => {
    try {
      const q = query(collection(db, 'family'), where('customerId', '==', customerId))
      const snapshot = await getDocs(q)
      setFamily(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFamily() }, [customerId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await addDoc(collection(db, 'family'), {
        customerId,
        relation: formData.get('relation'),
        name: formData.get('name'),
        birthDate: formData.get('birthDate'),
        phone: formData.get('phone'),
        createdAt: new Date().toISOString()
      })
      fetchFamily()
      e.currentTarget.reset()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-4">가족 관계</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-3 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">관계</label><input type="text" name="relation" placeholder="배우자, 자녀 등" className="w-full text-sm p-2 border rounded" required /></div>
          <div><label className="block text-xs text-gray-500 mb-1">이름</label><input type="text" name="name" className="w-full text-sm p-2 border rounded" required /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">생년월일</label><input type="date" name="birthDate" className="w-full text-sm p-2 border rounded" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">연락처</label><input type="tel" name="phone" className="w-full text-sm p-2 border rounded" /></div>
        </div>
        <div className="flex justify-end"><button type="submit" className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm">추가</button></div>
      </form>
      <div className="space-y-3">
        {loading ? <div className="text-center text-sm">로딩중...</div> : family.map(f => (
          <div key={f.id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
            <div><div className="flex items-baseline gap-2"><span className="text-sm font-bold text-blue-600">{f.relation}</span><span className="font-medium text-gray-900">{f.name}</span></div><div className="text-xs text-gray-500 mt-1">{f.birthDate} | {f.phone}</div></div>
          </div>
        ))}
      </div>
    </div>
  )
}
