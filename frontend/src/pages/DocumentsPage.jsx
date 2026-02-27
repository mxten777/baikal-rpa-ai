import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiSearch, FiFileText, FiFilter, FiDownload, FiEye, FiX, FiClock, FiFile } from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'

const DOC_TYPES = { report: '보고서', official: '공문', email: '이메일' }
const DOC_COLORS = {
  report: 'bg-blue-50 text-blue-600 border-blue-100',
  official: 'bg-amber-50 text-amber-600 border-amber-100',
  email: 'bg-emerald-50 text-emerald-600 border-emerald-100',
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [previewDoc, setPreviewDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/docs/').then((r) => setDocs(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const remove = async (id, e) => {
    e.stopPropagation()
    if (!confirm('이 문서를 삭제하시겠습니까?')) return
    await api.delete(`/docs/${id}`)
    toast.success('문서 삭제 완료')
    if (previewDoc?.id === id) setPreviewDoc(null)
    load()
  }

  const filtered = docs.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || d.doc_type === filterType
    return matchSearch && matchType
  })

  const downloadDoc = (doc, e) => {
    e.stopPropagation()
    const blob = new Blob([doc.output_content || ''], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.title}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('다운로드 완료')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0">
              <FiFileText size={14} />
            </div>
            문서 관리
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 ml-9 sm:ml-10">AI가 자동 생성한 문서를 관리합니다 · 총 {docs.length}건</p>
        </div>
        <Link
          to="/documents/new"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-baikal-600 to-baikal-700 hover:from-baikal-700 hover:to-baikal-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shrink-0"
        >
          <FiPlus size={16} /> 새 문서 생성
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="문서 제목으로 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <FiX size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto">
          {[{ value: 'all', label: '전체' }, ...Object.entries(DOC_TYPES).map(([v, l]) => ({ value: v, label: l }))].map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                filterType === t.value ? 'bg-baikal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Cards */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FiFileText className="mx-auto text-gray-200 mb-3" size={48} />
          <p className="text-gray-400 font-medium">{search || filterType !== 'all' ? '검색 결과가 없습니다' : '아직 생성된 문서가 없습니다'}</p>
          <p className="text-gray-300 text-sm mt-1">AI를 활용해 보고서, 공문, 이메일을 자동으로 생성해보세요</p>
          <Link to="/documents/new" className="inline-flex items-center gap-2 mt-4 bg-baikal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-baikal-700 transition">
            <FiPlus size={14} /> 첫 문서 만들기
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b text-left">
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">문서</th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider w-24">유형</th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider w-36">생성일시</th>
                <th className="px-5 py-3.5 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition group cursor-pointer" onClick={() => setPreviewDoc(d)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${DOC_COLORS[d.doc_type] || 'bg-gray-50 text-gray-400'}`}>
                        <FiFile size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{d.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-sm">
                          {d.output_content?.slice(0, 60) || d.content_prompt?.slice(0, 60) || ''}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${DOC_COLORS[d.doc_type] || 'bg-gray-50 text-gray-500'}`}>
                      {DOC_TYPES[d.doc_type] || d.doc_type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <FiClock size={12} />
                      <span className="text-xs">{new Date(d.created_at).toLocaleString('ko', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition justify-end">
                      <button onClick={(e) => { e.stopPropagation(); setPreviewDoc(d) }} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition" title="미리보기">
                        <FiEye size={14} />
                      </button>
                      <button onClick={(e) => downloadDoc(d, e)} className="p-2 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition" title="다운로드">
                        <FiDownload size={14} />
                      </button>
                      <button onClick={(e) => remove(d.id, e)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition" title="삭제">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="font-bold text-gray-900">{previewDoc.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${DOC_COLORS[previewDoc.doc_type]}`}>
                    {DOC_TYPES[previewDoc.doc_type]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(previewDoc.created_at).toLocaleString('ko')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => downloadDoc(previewDoc, e)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition" title="다운로드">
                  <FiDownload size={16} />
                </button>
                <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
                  <FiX size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{previewDoc.output_content || '내용 없음'}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
