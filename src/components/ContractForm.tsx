'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Edit2, Trash2, X, Check } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'

export default function ContractForm({ customerId }: { customerId: string }) {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    contractNumber: '',
    type: '생명보험',
    name: '',
    company: '',
    premium: '',
    date: '',
    status: '정상'
  })

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

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEditClick = (c: any) => {
    setEditingId(c.id)
    setFormData({
      contractNumber: c.contractNumber || '',
      type: c.type || '생명보험',
      name: c.name || '',
      company: c.company || '',
      premium: c.premium?.toString() || '',
      date: c.date || '',
      status: c.status || '정상'
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({
      contractNumber: '', type: '생명보험', name: '', company: '', premium: '', date: '', status: '정상'
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteDoc(doc(db, 'contracts', id))
      fetchContracts()
    } catch (err) {
      console.error(err)
      alert('삭제 실패')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    
    const data = {
      customerId,
      contractNumber: formData.contractNumber,
      type: formData.type,
      name: formData.name,
      company: formData.company,
      premium: Number(formData.premium),
      date: formData.date,
      status: formData.status,
      updatedAt: new Date().toISOString()
    }
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'contracts', editingId), data)
      } else {
        await addDoc(collection(db, 'contracts'), { ...data, createdAt: new Date().toISOString() })
      }
      fetchContracts()
      handleCancelEdit()
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
      
      <form onSubmit={handleSubmit} className={`mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg border ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent'}`}>
        {editingId && <div className="lg:col-span-3 text-sm font-bold text-blue-600 mb-2">계약 수정 중...</div>}
        <div><label className="block text-xs text-gray-500 mb-1">계약번호</label><input type="text" name="contractNumber" value={formData.contractNumber} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">보험사</label><input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">상품명</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">종류</label><select name="type" value={formData.type} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded"><option>생명보험</option><option>손해보험</option><option>자동차</option><option>화재/재물</option><option>기타</option></select></div>
        <div><label className="block text-xs text-gray-500 mb-1">월 보험료 (원)</label><input type="number" name="premium" value={formData.premium} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">계약일</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded" required /></div>
        <div><label className="block text-xs text-gray-500 mb-1">상태</label><select name="status" value={formData.status} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded"><option>정상</option><option>실효</option><option>해지</option><option>만기</option></select></div>
        <div className="lg:col-span-3 flex justify-end gap-2 mt-2">
          {editingId && <button type="button" onClick={handleCancelEdit} className="flex items-center gap-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"><X className="w-4 h-4" />취소</button>}
          <button type="submit" disabled={submitting} className={`flex items-center gap-1 text-white px-4 py-2 rounded-md text-sm ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
            {editingId ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {editingId ? '수정 저장' : '추가'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead><tr className="bg-gray-50 border-y border-gray-200"><th className="p-3">계약번호</th><th className="p-3">보험사/상품명</th><th className="p-3">보험료</th><th className="p-3">계약일</th><th className="p-3 text-center">상태</th><th className="p-3 text-right">관리</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-4 text-center">로딩중...</td></tr> : contracts.map(c => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-gray-600">{c.contractNumber}</td>
                <td className="p-3 font-medium text-gray-900">{c.company}<div className="text-xs text-gray-500 font-normal">{c.name} ({c.type})</div></td>
                <td className="p-3">{c.premium.toLocaleString()}원</td>
                <td className="p-3 text-gray-500">{c.date}</td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{c.status}</span></td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => handleEditClick(c)} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {!loading && contracts.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">등록된 계약이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
