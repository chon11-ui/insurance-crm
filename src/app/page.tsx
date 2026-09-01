'use client'

import { useEffect, useState } from 'react'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Search, PlusCircle, User, LogOut } from 'lucide-react'
import ExportCSV from '@/components/ExportCSV'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import LogoutButton from '@/components/LogoutButton'

export default function Home() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const q = query(
          collection(db, 'customers'),
          where('plannerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setCustomers(data)
      } catch (err: any) {
        console.error('Fetch error:', err)
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const filteredCustomers = customers.filter(c => 
    c.name?.includes(searchQuery) || c.phone?.includes(searchQuery)
  )

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩중...</div>
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 max-w-4xl mx-auto mt-20 bg-white rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">데이터베이스 에러</h1>
        <p>{error}</p>
        <button onClick={() => signOut(auth)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">다시 로그인</button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              보험고객 관리 CRM
            </h1>
            <p className="text-gray-500 mt-1">총 {filteredCustomers.length}명의 고객이 등록되어 있습니다.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <ExportCSV customers={filteredCustomers} />
            <Link 
              href="/customers/new" 
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              신규 등록
            </Link>
            <button onClick={() => signOut(auth).then(() => router.push('/login'))} className="flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </header>

        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="고객 이름 또는 전화번호 검색..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer: any) => (
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

          {filteredCustomers.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다. 신규 고객을 등록해보세요!'}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
