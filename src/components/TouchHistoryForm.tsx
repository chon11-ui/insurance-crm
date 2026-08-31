'use client'

import { useState } from 'react'
import { addTouchHistory } from '@/app/actions/customer'

export function TouchHistoryForm({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      date: new Date(formData.get('date') as string)
    }

    try {
      await addTouchHistory(customerId, data)
      ;(e.target as HTMLFormElement).reset()
    } catch (e) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col md:flex-row gap-2">
      <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 md:w-40" />
      <select name="type" className="px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 bg-white md:w-40">
        <option value="선물 지급">선물 지급</option>
        <option value="보장분석 발행">보장분석 발행</option>
        <option value="상담 진행">상담 진행</option>
        <option value="안부 인사">안부 인사</option>
        <option value="기타">기타</option>
      </select>
      <input name="description" placeholder="상세 내용" className="flex-1 px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
      <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
        이력 추가
      </button>
    </form>
  )
}
