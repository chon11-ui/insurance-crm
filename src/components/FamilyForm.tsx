'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Edit2, Trash2, X, Check } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'

export default function FamilyForm({ customerId }: { customerId: string }) {
  const [family, setFamily] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    relation: '',
    name: '',
    birthDate: '',
    phone: ''
  })

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

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEditClick = (f: any) => {
    setEditingId(f.id)
    setFormData({
      relation: f.relation || '',
      name: f.name || '',
      birthDate: f.birthDate || '',
      phone: f.phone || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ relation: '', name: '', birthDate: '', phone: '' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteDoc(doc(db, 'family', id))
      fetchFamily()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const data = {
      customerId,
      relation: formData.relation,
      name: formData.name,
      birthDate: formData.birthDate,
      phone: formData.phone,
      updatedAt: new Date().toISOString()
    }
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'family', editingId), data)
      } else {
        await addDoc(collection(db, 'family'), { ...data, createdAt: new Date().toISOString() })
      }
      fetchFamily()
      handleCancelEdit()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-4">가족 관계</h2>
      
      <form onSubmit={handleSubmit} className={`mb-6 space-y-3 p-4 rounded-lg border ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent'}`}>
        {editingId && <div className="text-sm font-bold text-blue-600 mb-2">가족 수정 중...</div>}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">관계</label><input type="text" name="relation" value={formData.relation} onChange={handleChange} placeholder="배우자, 자녀 등" className="w-full text-sm p-2 border border-gray-300 rounded" required /></div>
          <div><label className="block text-xs text-gray-500 mb-1">이름</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded" required /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">생년월일</label><input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">연락처</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          {editingId && <button type="button" onClick={handleCancelEdit} className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 text-sm"><X className="w-4 h-4" />취소</button>}
          <button type="submit" className={`flex items-center gap-1 text-white px-3 py-1.5 rounded-md text-sm ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
            {editingId ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {editingId ? '저장' : '추가'}
          </button>
        </div>
      </form>
      
      <div className="space-y-3">
        {loading ? <div className="text-center text-sm">로딩중...</div> : family.map(f => (
          <div key={f.id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center group hover:bg-gray-50">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-blue-600">{f.relation}</span>
                <span className="font-medium text-gray-900">{f.name}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{f.birthDate} {f.phone ? `| ${f.phone}` : ''}</div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditClick(f)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(f.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {!loading && family.length === 0 && <div className="text-center text-sm text-gray-500 p-4">등록된 가족이 없습니다.</div>}
      </div>
    </div>
  )
}
