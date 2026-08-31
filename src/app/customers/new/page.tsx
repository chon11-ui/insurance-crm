'use client'

import { useState } from 'react'
import { createCustomer } from '@/app/actions/customer'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string

    if (!name || !phone) {
      alert('이름과 전화번호는 필수입니다.')
      setLoading(false)
      return
    }

    try {
      const customer = await createCustomer({ name, phone, address })
      router.push(`/customers/${customer.id}`)
    } catch (error) {
      console.error(error)
      alert('고객 등록에 실패했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            신규 고객 등록
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">고객 이름 <span className="text-red-500">*</span></label>
            <input 
              name="name" 
              type="text" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              placeholder="예: 홍길동"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 <span className="text-red-500">*</span></label>
            <input 
              name="phone" 
              type="text" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              placeholder="예: 010-1234-5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
            <input 
              name="address" 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              placeholder="전체 주소 입력"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/" className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              취소
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '등록 중...' : '등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
