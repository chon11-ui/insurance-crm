'use client'

import { useState } from 'react'
import { addFamilyMember } from '@/app/actions/customer'
import { Users } from 'lucide-react'

export function FamilyForm({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const relation = formData.get('relation') as string
    const phone = formData.get('phone') as string

    if (!name || !relation) return alert('이름과 관계를 입력해주세요.')

    try {
      await addFamilyMember(customerId, { name, relation, phone })
      ;(e.target as HTMLFormElement).reset()
    } catch (e) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col md:flex-row gap-2">
      <input name="name" required placeholder="가족 이름" className="flex-1 px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
      <input name="relation" required placeholder="관계 (예: 배우자, 자녀)" className="flex-1 px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
      <input name="phone" placeholder="연락처" className="flex-1 px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md whitespace-nowrap hover:bg-blue-700 disabled:opacity-50">
        추가
      </button>
    </form>
  )
}
