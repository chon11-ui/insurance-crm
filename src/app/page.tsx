import { getCustomers } from './actions/customer'
import Link from 'next/link'
import { Users, Search, PlusCircle, User, LogOut } from 'lucide-react'
import ExportCSV from '@/components/ExportCSV'

export const dynamic = 'force-dynamic'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q || ''
  const customers = await getCustomers(query)

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              보험고객 관리 CRM
            </h1>
            <p className="text-gray-500 mt-1">총 {customers.length}명의 고객이 등록되어 있습니다.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <ExportCSV customers={customers} />
            <Link 
              href="/customers/new" 
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              신규 등록
            </Link>
            <form action={async () => {
              'use server'
              const { removeSession } = await import('./actions/auth')
              await removeSession()
            }}>
              <button className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </form>
          </div>
        </header>

        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <form className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="고객 이름 또는 전화번호 검색..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="hidden">검색</button>
          </form>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer: any) => (
            <Link key={customer.id} href={`/customers/${customer.id}`} className="block group">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow group-hover:border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📞 {customer.phone}</p>
                  <p className="truncate">📍 {customer.address || '주소 미입력'}</p>
                </div>
              </div>
            </Link>
          ))}

          {customers.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
              {query ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다. 신규 고객을 등록해보세요!'}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
