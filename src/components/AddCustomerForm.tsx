'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export default function AddCustomerForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    residentNumBack: '',
    address: '',
    job: '',
    notes: '',
    status: '가망고객'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = auth.currentUser
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      const docRef = await addDoc(collection(db, 'customers'), {
        ...formData,
        plannerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      router.push(`/customers/${docRef.id}`)
    } catch (error) {
      console.error('Error adding customer:', error)
      alert('고객 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">이름 *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">연락처 *</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
                <div>
          <label className="block text-sm font-medium text-gray-700">주민등록번호</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              name="birthDate"
              maxLength={6}
              placeholder="생년월일 6자리"
              value={formData.birthDate}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
            <span className="text-gray-500">-</span>
            <input
              type="password"
              name="residentNumBack"
              maxLength={7}
              placeholder="뒷자리 7자리"
              value={formData.residentNumBack}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">진행 상태</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange as any}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          >
            <option value="가망고객">가망고객</option>
            <option value="보장분석">보장분석</option>
            <option value="계약체결">계약체결</option>
            <option value="유지관리">유지관리</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">직업</label>
          <input
            type="text"
            name="job"
            value={formData.job}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">주소</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">특이사항</label>
        <textarea
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {loading ? '등록 중...' : '고객 등록'}
        </button>
      </div>
    </form>
  )
}
