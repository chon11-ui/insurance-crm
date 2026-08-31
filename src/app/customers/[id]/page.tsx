import { getCustomer, deleteCustomer } from '@/app/actions/customer'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, MapPin, Trash2, Calendar, FileText, Gift, Users } from 'lucide-react'
import { format } from 'date-fns'
import { FamilyForm } from '@/components/FamilyForm'
import { ContractForm } from '@/components/ContractForm'
import { TouchHistoryForm } from '@/components/TouchHistoryForm'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await getCustomer(id)
  if (!customer) notFound()

  const handleDelete = async () => {
    'use server'
    await deleteCustomer(id)
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              고객 상세 정보
            </h1>
          </div>
          <form action={handleDelete}>
            <button type="submit" className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" /> 고객 삭제
            </button>
          </form>
        </header>

        {/* 기본 정보 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              <p className="text-sm text-gray-500">등록일: {format(customer.createdAt, 'yyyy-MM-dd')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center gap-2"><Phone className="w-5 h-5 text-gray-400" /> {customer.phone}</p>
            <p className="flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-400" /> {customer.address || '주소 미입력'}</p>
          </div>
        </section>

        {/* 가족 정보 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2">
            <Users className="w-5 h-5 text-blue-500" />
            가족 정보 ({customer.familyMembers.length}/4)
          </h3>
          {customer.familyMembers.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customer.familyMembers.map((f: any) => (
                <li key={f.id} className="bg-gray-50 p-3 rounded-lg border flex flex-col">
                  <span className="font-medium text-gray-900">{f.name} <span className="text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full ml-1">{f.relation}</span></span>
                  {f.phone && <span className="text-sm text-gray-600 mt-1">📞 {f.phone}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">등록된 가족이 없습니다.</p>
          )}
          {customer.familyMembers.length < 4 && <FamilyForm customerId={customer.id} />}
        </section>

        {/* 보유 계약 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            보유 계약
          </h3>
          <div className="space-y-3">
            {customer.contracts.map((c: any) => (
              <div key={c.id} className="bg-gray-50 p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{c.company}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === '유지' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-gray-700">{c.productName}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>월 <strong className="text-gray-900">{c.premium.toLocaleString()}</strong>원</p>
                  {c.contractDate && <p>가입일: {format(c.contractDate, 'yyyy-MM-dd')}</p>}
                </div>
              </div>
            ))}
            {customer.contracts.length === 0 && <p className="text-gray-500 text-sm">등록된 계약이 없습니다.</p>}
          </div>
          <ContractForm customerId={customer.id} />
        </section>

        {/* 터치 이력 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2">
            <Gift className="w-5 h-5 text-green-500" />
            터치 / 활동 이력
          </h3>
          <div className="space-y-4 mb-4 max-h-80 overflow-y-auto pr-2">
            {customer.touchHistories.map((t: any) => (
              <div key={t.id} className="flex gap-4 items-start relative pl-4 border-l-2 border-gray-200">
                <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(t.date, 'yyyy-MM-dd')}
                    </span>
                    <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">{t.type}</span>
                  </div>
                  {t.description && <p className="mt-1 text-gray-700">{t.description}</p>}
                </div>
              </div>
            ))}
            {customer.touchHistories.length === 0 && <p className="text-gray-500 text-sm pl-4 border-l-2 border-gray-200">터치 이력이 없습니다.</p>}
          </div>
          <TouchHistoryForm customerId={customer.id} />
        </section>
      </div>
    </div>
  )
}
