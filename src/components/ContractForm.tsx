'use client'

import { useState } from 'react'
import { addContract } from '@/app/actions/customer'

export function ContractForm({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      company: formData.get('company'),
      productName: formData.get('productName'),
      premium: formData.get('premium'),
      status: formData.get('status'),
      contractDate: formData.get('contractDate')
    }

    try {
      await addContract(customerId, data)
      ;(e.target as HTMLFormElement).reset()
    } catch (e) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2">
      <input name="company" required placeholder="보험사명" className="px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
      <input name="productName" required placeholder="상품명" className="px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 md:col-span-2" />
      <input name="premium" type="number" required placeholder="월 보험료(원)" className="px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
      <select name="status" className="px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 bg-white">
        <option value="유지">유지</option>
        <option value="실효">실효</option>
        <option value="해지">해지</option>
        <option value="만기">만기</option>
      </select>
      <input name="contractDate" type="date" className="px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
      <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 md:col-span-4">
        계약 추가
      </button>
    </form>
  )
}
