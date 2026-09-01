'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'

export default function TouchHistoryForm({ customerId }: { customerId: string }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, 'touchHistory'), where('customerId', '==', customerId))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setHistory(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [customerId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await addDoc(collection(db, 'touchHistory'), {
        customerId,
        type: formData.get('type'),
        date: formData.get('date'),
        content: formData.get('content'),
        createdAt: new Date().toISOString()
      })
      fetchHistory()
      e.currentTarget.reset()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">터치(상담) 이력</h2>
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg flex gap-3 items-start">
        <div className="w-1/4"><select name="type" className="w-full text-sm p-2 border rounded"><option>전화</option><option>방문</option><option>카톡</option><option>기타</option></select></div>
        <div className="w-1/4"><input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full text-sm p-2 border rounded" required /></div>
        <div className="w-2/4 flex gap-2"><input type="text" name="content" placeholder="상담 내용을 입력하세요..." className="w-full text-sm p-2 border rounded" required /><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md whitespace-nowrap text-sm">기록</button></div>
      </form>
      <div className="space-y-4">
        {loading ? <div className="text-center text-sm">로딩중...</div> : history.map(h => (
          <div key={h.id} className="relative pl-6 pb-4 border-l-2 border-blue-200 last:border-0 last:pb-0">
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
            <div className="flex gap-3 items-baseline mb-1"><span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{h.type}</span><span className="text-xs text-gray-500">{h.date}</span></div>
            <p className="text-sm text-gray-800">{h.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
