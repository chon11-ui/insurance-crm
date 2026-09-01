import { getCustomers } from '@/app/actions/customer'
import { getAdminInitError } from '@/lib/firebase-admin'
import CustomerList from '@/components/CustomerList'
import AddCustomerForm from '@/components/AddCustomerForm'
import ExportCSV from '@/components/ExportCSV'
import LogoutButton from '@/components/LogoutButton'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const sessionCookie = (await cookies()).get('__session')?.value
  if (!sessionCookie) {
    redirect('/login')
  }

  const adminError = getAdminInitError()
  if (adminError) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-2xl font-bold mb-4">데이터베이스 연결 실패 (환경변수 오류)</h1>
        <p>Netlify에 등록된 Firebase 환경변수에 문제가 있습니다.</p>
        <pre className="mt-4 bg-red-50 p-4 rounded text-sm overflow-auto">{adminError}</pre>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    )
  }

  try {
    const customers = await getCustomers()
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">고객 CRM 관리</h1>
            <div className="flex gap-2">
              <ExportCSV data={customers} />
              <LogoutButton />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AddCustomerForm />
            </div>
            
            <div className="lg:col-span-2">
              <CustomerList initialCustomers={customers} />
            </div>
          </div>
        </div>
      </main>
    )
  } catch (error: any) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-2xl font-bold mb-4">앱 로딩 실패</h1>
        <pre className="mt-4 bg-red-50 p-4 rounded text-sm overflow-auto">{error.message || String(error)}</pre>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    )
  }
}
