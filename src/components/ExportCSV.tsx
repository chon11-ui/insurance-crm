'use client'

import { useState } from 'react'
import { Download, X } from 'lucide-react'

const ALL_FIELDS = [
  { id: 'name', label: '이름', checked: true },
  { id: 'phone', label: '연락처', checked: true },
  { id: 'birthDate', label: '생년월일(앞6자리)', checked: true },
  { id: 'residentNumBack', label: '주민번호 뒷자리', checked: true },
  { id: 'job', label: '직업', checked: true },
  { id: 'address', label: '주소', checked: true },
  { id: 'notes', label: '특이사항', checked: true },
  { id: 'createdAt', label: '등록일', checked: true }
]

export default function ExportCSV({ customers }: { customers: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [fields, setFields] = useState(ALL_FIELDS)

  const toggleField = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, checked: !f.checked } : f))
  }

  const handleExport = () => {
    const selectedFields = fields.filter(f => f.checked)
    if (selectedFields.length === 0) {
      alert('다운로드할 항목을 하나 이상 선택해주세요.')
      return
    }

    // CSV Header
    let csvContent = selectedFields.map(f => f.label).join(',') + '\n'
    
    // Add rows
    customers.forEach(c => {
      const row = selectedFields.map(f => {
        let val = c[f.id] || ''
        
        // Handle dates if they are firestore timestamps (though they should be ISO strings now)
        if (f.id === 'createdAt') {
          if (val && typeof val === 'object' && val.seconds) {
            val = new Date(val.seconds * 1000).toLocaleDateString()
          } else if (val && typeof val === 'string') {
            val = new Date(val).toLocaleDateString()
          }
        }
        
        // Escape quotes and wrap in quotes to handle commas/newlines
        val = String(val).replace(/"/g, '""')
        return `"${val}"`
      }).join(',')
      
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
    
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium shadow-sm flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        엑셀(CSV) 다운로드
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-900">다운로드 항목 선택</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-500 mb-4">엑셀 파일에 포함할 고객 정보를 선택해주세요.</p>
              {fields.map(f => (
                <label key={f.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer border border-gray-100">
                  <input 
                    type="checkbox" 
                    checked={f.checked}
                    onChange={() => toggleField(f.id)}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{f.label}</span>
                </label>
              ))}
            </div>
            <div className="p-4 border-t bg-gray-50 flex gap-2 justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
              >
                취소
              </button>
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                다운로드 실행
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
