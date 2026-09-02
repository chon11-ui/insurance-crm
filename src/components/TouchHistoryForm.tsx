'use client'

import { useState, useEffect } from 'react'
import { Edit2, Trash2, X, Check } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'

export default function TouchHistoryForm({ customerId }: { customerId: string }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    type: '전화',
    date: new Date().toISOString().split('T')[0],
    content: ''
  })

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

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEditClick = (h: any) => {
    setEditingId(h.id)
    setFormData({
      type: h.type || '전화',
      date: h.date || new Date().toISOString().split('T')[0],
      content: h.content || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ type: '전화', date: new Date().toISOString().split('T')[0], content: '' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteDoc(doc(db, 'touchHistory', id))
      fetchHistory()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const data = {
      customerId,
      type: formData.type,
      date: formData.date,
      content: formData.content,
      updatedAt: new Date().toISOString()
    }
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'touchHistory', editingId), data)
      } else {
        await addDoc(collection(db, 'touchHistory'), { ...data, createdAt: new Date().toISOString() })
      }
      fetchHistory()
      handleCancelEdit()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">터치(상담) 이력</h2>
      
      <form onSubmit={handleSubmit} className={`mb-6 p-4 rounded-lg flex flex-col sm:flex-row gap-3 items-start border ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent'}`}>
        <div className="w-full sm:w-1/4"><select name="type" value={formData.type} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded"><option>전화</option><option>방문</option><option>카톡</option><option>기타</option></select></div>
        <div className="w-full sm:w-1/4"><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full text-sm p-2 border border-gray-300 rounded" required /></div>
        <div className="w-full sm:w-2/4 flex flex-col sm:flex-row gap-2">
          <input type="text" name="content" value={formData.content} onChange={handleChange} placeholder="상담 내용을 입력하세요..." className="w-full text-sm p-2 border border-gray-300 rounded" required />
          <div className="flex gap-2 shrink-0">
            {editingId && <button type="button" onClick={handleCancelEdit} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 text-sm"><X className="w-4 h-4" /></button>}
            <button type="submit" className={`text-white px-4 py-2 rounded-md whitespace-nowrap text-sm flex items-center gap-1 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
              {editingId ? <Check className="w-4 h-4" /> : '기록'}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {loading ? <div className="text-center text-sm">로딩중...</div> : history.map(h => (
          <div key={h.id} className="group relative pl-6 pb-4 border-l-2 border-blue-200 last:border-0 last:pb-0">
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-baseline mb-1">
                <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{h.type}</span>
                <span className="text-xs text-gray-500">{h.date}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditClick(h)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(h.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-sm text-gray-800">{h.content}</p>
          </div>
        ))}
        {!loading && history.length === 0 && <div className="text-center text-sm text-gray-500 p-4">등록된 이력이 없습니다.</div>}
      </div>
    </div>
  )
}
