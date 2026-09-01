'use client'

export default function ExportCSV({ customers }: { customers: any[] }) {
  
  const handleExport = () => {
    // CSV Header
    let csvContent = '이름,연락처,주소,등록일\n'
    
    // Add rows
    customers.forEach(c => {
      const row = [
        c.name || '',
        c.phone || '',
        `"${c.address || ''}"`, // Wrap in quotes to handle commas in address
        c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : ''
      ].join(',')
      
      csvContent += row + '\n'
    })
    
    // Create Blob and trigger download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }) // \uFEFF for Excel UTF-8 BOM
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `고객데이터_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button 
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium shadow-sm flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      엑셀(CSV) 다운로드
    </button>
  )
}
