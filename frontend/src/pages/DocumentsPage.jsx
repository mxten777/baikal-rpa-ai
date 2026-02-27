import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiSearch, FiFileText, FiFilter, FiDownload, FiEye, FiX, FiClock, FiFile, FiGrid, FiList } from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'

const DOC_TYPES = { report: '보고서', official: '공문', email: '이메일' }
const DOC_COLORS = {
  report: 'bg-blue-50 text-blue-600 border-blue-100',
  official: 'bg-amber-50 text-amber-600 border-amber-100',
  email: 'bg-emerald-50 text-emerald-600 border-emerald-100',
}
const DOC_GRADIENTS = {
  report: 'from-blue-500 to-blue-600',
  official: 'from-amber-500 to-amber-600',
  email: 'from-emerald-500 to-emerald-600',
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [previewDoc, setPreviewDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

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
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
              <FiFileText size={14} />
            </div>
            문서 관리
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 ml-9 sm:ml-10">AI가 자동 생성한 문서를 관리합니다 · 총 {docs.length}건</p>
        </div>
        <Link
          to="/documents/new"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-baikal-600 to-baikal-700 hover:from-baikal-500 hover:to-baikal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-baikal-500/20 focus:border-baikal-400 outline-none bg-white transition-all hover:border-gray-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition">
              <FiX size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
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
          {/* View mode toggle */}
          <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
              <FiGrid size={14} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
              <FiList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Document Cards / Table */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="skeleton h-10 w-10 rounded-xl mb-4" />
              <div className="skeleton h-5 w-3/4 mb-2" />
              <div className="skeleton h-3 w-full mb-1" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <FiFileText className="text-gray-200" size={32} />
          </div>
          <p className="text-gray-400 font-medium">{search || filterType !== 'all' ? '검색 결과가 없습니다' : '아직 생성된 문서가 없습니다'}</p>
          <p className="text-gray-300 text-sm mt-1">AI를 활용해 보고서, 공문, 이메일을 자동으로 생성해보세요</p>
          <Link to="/documents/new" className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-baikal-600 to-baikal-700 text-white px-4 py-2 rounded-xl text-sm hover:from-baikal-500 hover:to-baikal-600 transition-all shadow-sm">
            <FiPlus size={14} /> 첫 문서 만들기
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {filtered.map((d) => (
            <div
              key={d.id}
              onClick={() => setPreviewDoc(d)}
              className="group bg-white rounded-2xl border border-gray-100 p-5 card-hover cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${DOC_COLORS[d.doc_type] || 'bg-gray-50 text-gray-400'} group-hover:scale-110 transition-transform duration-300`}>
                  <FiFile size={18} />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setPreviewDoc(d) }} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition" title="미리보기">
                    <FiEye size={13} />
                  </button>
                  <button onClick={(e) => downloadDoc(d, e)} className="p-1.5 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition" title="다운로드">
                    <FiDownload size={13} />
                  </button>
                  <button onClick={(e) => remove(d.id, e)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition" title="삭제">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-baikal-700 transition truncate">{d.title}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {d.output_content?.slice(0, 80) || d.content_prompt?.slice(0, 80) || '내용 없음'}...
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${DOC_COLORS[d.doc_type] || 'bg-gray-50 text-gray-500'}`}>
                  {DOC_TYPES[d.doc_type] || d.doc_type}
                </span>
                <div className="flex items-center gap-1 text-gray-400">
                  <FiClock size={10} />
                  <span className="text-[10px]">{new Date(d.created_at).toLocaleDateString('ko')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List/Table View */
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b text-left">
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">문서</th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider w-24 hidden sm:table-cell">유형</th>
                <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider w-36 hidden md:table-cell">생성일시</th>
                <th className="px-5 py-3.5 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition group cursor-pointer" onClick={() => setPreviewDoc(d)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${DOC_COLORS[d.doc_type] || 'bg-gray-50 text-gray-400'} group-hover:scale-105 transition-transform`}>
                        <FiFile size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-baikal-700 transition">{d.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-sm">
                          {d.output_content?.slice(0, 60) || d.content_prompt?.slice(0, 60) || ''}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${DOC_COLORS[d.doc_type] || 'bg-gray-50 text-gray-500'}`}>
                      {DOC_TYPES[d.doc_type] || d.doc_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
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
