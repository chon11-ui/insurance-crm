'use client'

import { useState, useEffect } from 'react'
import { PlusCircle } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'

export default function ContractForm({ customerId }: { customerId: string }) {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchContracts = async () => {
    try {
      const q = query(collection(db, 'contracts'), where('customerId', '==', customerId))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setContracts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [customerId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      customerId,
      contractNumber: formData.get('contractNumber'),
      type: formData.get('type'),
      name: formData.get('name'),
      company: formData.get('company'),
      premium: Number(formData.get('premium')),
      date: formData.get('date'),
      status: formData.get('status'),
      createdAt: new Date().toISOString()
    }
    
    try {
      await addDoc(collection(db, 'contracts'), data)
      fetchContracts()
      e.currentTarget.reset()
    } catch (err) {
      console.error(err)
      alert('저장 실패')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">계약 정보</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div><label className="block text-xs text-gray-500 mb-1">계약번호</label><input type="text" name="contractNumber" className="w-full text-sm p-2 border rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">보험사</label><input type="text" name="company" className="w-full text-sm p-2 border rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">상품명</label><input type="text" name="name" className="w-full text-sm p-2 border rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">종류</label><select name="type" className="w-full text-sm p-2 border rounded"><option>생명보험</option><option>손해보험</option><option>자동차</option><option>화재/재물</option><option>기타</option></select></div>
        <div><label className="block text-xs text-gray-500 mb-1">월 보험료 (원)</label><input type="number" name="premium" className="w-full text-sm p-2 border rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">계약일</label><input type="date" name="date" className="w-full text-sm p-2 border rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">상태</label><select name="status" className="w-full text-sm p-2 border rounded"><option>정상</option><option>실효</option><option>해지</option><option>만기</option></select></div>
        <div className="lg:col-span-3 flex justify-end mt-2"><button type="submit" disabled={submitting} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"><PlusCircle className="w-4 h-4" />추가</button></div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead><tr className="bg-gray-50 border-y border-gray-200"><th className="p-3">계약번호</th><th className="p-3">보험사/상품명</th><th className="p-3">보험료</th><th className="p-3">계약일</th><th className="p-3 text-center">상태</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-4 text-center">로딩중...</td></tr> : contracts.map(c => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-gray-600">{c.contractNumber}</td><td className="p-3 font-medium text-gray-900">{c.company}<div className="text-xs text-gray-500 font-normal">{c.name} ({c.type})</div></td><td className="p-3">{c.premium.toLocaleString()}원</td><td className="p-3 text-gray-500">{c.date}</td><td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{c.status}</span></td>
              </tr>
            ))}
            {!loading && contracts.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">등록된 계약이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
