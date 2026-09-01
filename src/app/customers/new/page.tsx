'use client'

import AddCustomerForm from '@/components/AddCustomerForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCustomerPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록으로 돌아가기
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h1 className="text-xl font-bold text-gray-900">신규 고객 등록</h1>
            <p className="text-sm text-gray-500 mt-1">새로운 보험 고객의 기본 정보를 입력해주세요.</p>
          </div>
          <div className="p-6">
            <AddCustomerForm />
          </div>
        </div>
      </div>
    </main>
  )
}
