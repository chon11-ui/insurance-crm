'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import ContractForm from '@/components/ContractForm'
import FamilyForm from '@/components/FamilyForm'
import TouchHistoryForm from '@/components/TouchHistoryForm'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const getBadgeColor = (status: string) => {
    switch (status) {
      case '보장분석': return 'bg-red-100 text-red-700 border-red-200'
      case '계약체결': return 'bg-blue-100 text-blue-700 border-blue-200'
      case '유지관리': return 'bg-green-100 text-green-700 border-green-200'
      case '가망고객':
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const router = useRouter()
  const { id } = use(params)
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRRN, setShowRRN] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      try {
        const docRef = doc(db, 'customers', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists() && docSnap.data().plannerId === user.uid) {
          setCustomer({ id: docSnap.id, ...docSnap.data() })
        } else {
          setError('고객 정보를 찾을 수 없거나 권한이 없습니다.')
        }
      } catch (err: any) {
        console.error(err)
        setError('데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [id, router])

  
  const handleEditClick = () => {
    setEditForm({ ...customer, status: Array.isArray(customer.status) ? customer.status : (customer.status ? [customer.status] : ['가망고객']) })
    setIsEditing(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const docRef = doc(db, 'customers', id)
      await updateDoc(docRef, {
        ...editForm,
        updatedAt: new Date().toISOString()
      })
      setCustomer({ ...customer, ...editForm })
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert('수정 실패')
    }
  }

  
  const handleStatusChange = (statusStr: string) => {
    setEditForm((prev: any) => {
      const current = prev.status || [];
      if (current.includes(statusStr)) {
        return { ...prev, status: current.filter((s: string) => s !== statusStr) };
      } else {
        return { ...prev, status: [...current, statusStr] };
      }
    });
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 고객을 삭제하시겠습니까? (관련된 모든 데이터가 삭제됩니다)')) return
    
    try {
      await deleteDoc(doc(db, 'customers', id))
      router.push('/')
    } catch (err) {
      console.error(err)
      alert('삭제 실패')
    }
  }

  if (loading) return <div className="p-8 text-center">로딩중...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!customer) return null

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록으로 돌아가기
          </Link>
          <div className="flex gap-2">
            <button onClick={handleEditClick} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md">
              <Edit className="w-4 h-4" />
              수정
            </button>
            <button onClick={handleDelete} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md">
              <Trash2 className="w-4 h-4" />
              고객 삭제
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              고객 상세 정보
              {!isEditing && (() => {
                const statuses = Array.isArray(customer.status) 
                  ? customer.status 
                  : (customer.status ? [customer.status] : ['가망고객']);
                return statuses.map((s: string) => (
                  <span key={s} className={`ml-2 px-3 py-1 text-sm font-bold rounded-full border ${getBadgeColor(s)}`}>
                    {s}
                  </span>
                ));
              })()}
            </h1>
          </div>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">이름</label><input type="text" name="name" value={editForm.name} onChange={handleEditChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700">연락처</label><input type="text" name="phone" value={editForm.phone} onChange={handleEditChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">주민등록번호 (앞 6자리 - 뒤 7자리)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="text" name="birthDate" maxLength={6} value={editForm.birthDate} onChange={handleEditChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    <span>-</span>
                    <input type="text" name="residentNumBack" maxLength={7} value={editForm.residentNumBack} onChange={handleEditChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">진행 상태 (다중 선택 가능)</label>
                  <div className="flex flex-wrap gap-3">
                    {['가망고객', '보장분석', '계약체결', '유지관리'].map(s => (
                      <label key={s} className="inline-flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(editForm.status || []).includes(s)}
                          onChange={() => handleStatusChange(s)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700">직업</label><input type="text" name="job" value={editForm.job} onChange={handleEditChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">주소</label><input type="text" name="address" value={editForm.address} onChange={handleEditChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">특이사항</label><textarea name="notes" rows={3} value={editForm.notes} onChange={handleEditChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">취소</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">저장</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div><p className="text-sm text-gray-500">이름</p><p className="text-lg font-medium text-gray-900">{customer.name}</p></div>
              <div><p className="text-sm text-gray-500">연락처</p><p className="text-lg font-medium text-gray-900">{customer.phone}</p></div>
              <div>
                <p className="text-sm text-gray-500">주민등록번호</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium text-gray-900">
                    {customer.birthDate || '-'}-{customer.residentNumBack ? (showRRN ? customer.residentNumBack : '*******') : '-'}
                  </p>
                  {customer.residentNumBack && (
                    <button 
                      onClick={() => setShowRRN(!showRRN)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                    >
                      {showRRN ? '숨기기' : '보기'}
                    </button>
                  )}
                </div>
              </div>
              <div><p className="text-sm text-gray-500">직업</p><p className="text-lg font-medium text-gray-900">{customer.job || '-'}</p></div>
              <div className="md:col-span-2"><p className="text-sm text-gray-500">주소</p><p className="text-lg font-medium text-gray-900">{customer.address || '-'}</p></div>
              <div className="md:col-span-2"><p className="text-sm text-gray-500">특이사항</p><div className="mt-1 p-4 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">{customer.notes || '-'}</div></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContractForm customerId={id} />
            <TouchHistoryForm customerId={id} />
          </div>
          <div className="lg:col-span-1">
            <FamilyForm customerId={id} />
          </div>
        </div>
      </div>
    </main>
  )
}
