'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import ContractForm from '@/components/ContractForm'
import FamilyForm from '@/components/FamilyForm'
import TouchHistoryForm from '@/components/TouchHistoryForm'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
            <button onClick={handleDelete} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md">
              <Trash2 className="w-4 h-4" />
              고객 삭제
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">고객 상세 정보</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div><p className="text-sm text-gray-500">이름</p><p className="text-lg font-medium text-gray-900">{customer.name}</p></div>
            <div><p className="text-sm text-gray-500">연락처</p><p className="text-lg font-medium text-gray-900">{customer.phone}</p></div>
            <div><p className="text-sm text-gray-500">생년월일</p><p className="text-lg font-medium text-gray-900">{customer.birthDate || '-'}</p></div>
            <div><p className="text-sm text-gray-500">직업</p><p className="text-lg font-medium text-gray-900">{customer.job || '-'}</p></div>
            <div className="md:col-span-2"><p className="text-sm text-gray-500">주소</p><p className="text-lg font-medium text-gray-900">{customer.address || '-'}</p></div>
            <div className="md:col-span-2"><p className="text-sm text-gray-500">특이사항</p><div className="mt-1 p-4 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">{customer.notes || '-'}</div></div>
          </div>
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
