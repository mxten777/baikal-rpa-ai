import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiPlay, FiCpu, FiGlobe, FiGrid, FiSearch, FiX, FiClock, FiArrowRight, FiRefreshCw, FiSettings, FiActivity } from 'react-icons/fi'

const TYPE_LABELS = { web_scrape: '웹 수집', excel_process: '엑셀 처리' }
const TYPE_ICONS = { web_scrape: FiGlobe, excel_process: FiGrid }
const TYPE_COLORS = {
  web_scrape: 'bg-blue-50 text-blue-600 border-blue-100',
  excel_process: 'bg-emerald-50 text-emerald-600 border-emerald-100',
}
const TYPE_GRADIENTS = {
  web_scrape: 'from-blue-500 to-indigo-600',
  excel_process: 'from-emerald-500 to-teal-600',
}

export default function AutomationsPage() {
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/automations/').then((r) => setList(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const remove = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('이 자동화를 삭제하시겠습니까?')) return
    await api.delete(`/automations/${id}`)
    toast.success('자동화 삭제 완료')
    load()
  }

  const run = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    setRunningId(id)
    try {
      await api.post(`/automations/${id}/run`)
      toast.success('자동화 실행이 시작되었습니다')
    } catch {
      toast.error('실행에 실패했습니다')
    } finally {
      setTimeout(() => setRunningId(null), 2000)
    }
  }

  const filtered = list.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || a.type === filterType
    return matchSearch && matchType
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
              <FiCpu size={14} />
            </div>
            업무 자동화
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 ml-9 sm:ml-10">RPA 작업을 등록하고 관리합니다 · 총 {list.length}건</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition active:scale-95" title="새로고침">
            <FiRefreshCw size={16} />
          </button>
          <Link
            to="/automations/new"
            className="flex items-center gap-2 bg-gradient-to-r from-baikal-600 to-baikal-700 hover:from-baikal-500 hover:to-baikal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <FiPlus size={16} /> 새 자동화
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="자동화 이름으로 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-baikal-500/20 focus:border-baikal-400 outline-none bg-white transition-all hover:border-gray-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition">
              <FiX size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto">
          {[{ value: 'all', label: '전체' }, ...Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))].map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === t.value ? 'bg-baikal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Automation Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="skeleton h-10 w-10 rounded-xl mb-4" />
              <div className="skeleton h-5 w-3/4 mb-3" />
              <div className="skeleton h-3 w-1/2 mb-2" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
            <FiCpu className="text-purple-200" size={32} />
          </div>
          <p className="text-gray-400 font-medium">{search || filterType !== 'all' ? '검색 결과가 없습니다' : '등록된 자동화가 없습니다'}</p>
          <p className="text-gray-300 text-sm mt-1">웹 데이터 수집, 엑셀 처리 등 반복 업무를 자동화하세요</p>
          <Link to="/automations/new" className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-baikal-600 to-baikal-700 text-white px-4 py-2 rounded-xl text-sm hover:from-baikal-500 hover:to-baikal-600 transition-all shadow-sm">
            <FiPlus size={14} /> 첫 자동화 등록
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 stagger">
          {filtered.map((a) => {
            const TypeIcon = TYPE_ICONS[a.type] || FiCpu
            const gradient = TYPE_GRADIENTS[a.type] || 'from-gray-500 to-gray-600'
            return (
              <Link
                key={a.id}
                to={`/automations/${a.id}`}
                className="group bg-white rounded-2xl border border-gray-100 p-5 card-hover block relative overflow-hidden"
              >
                {/* Subtle gradient accent on top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}>
                    <TypeIcon size={18} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => run(a.id, e)}
                      disabled={runningId === a.id}
                      className={`p-2 rounded-lg transition ${
                        runningId === a.id
                          ? 'bg-green-50 text-green-500'
                          : 'hover:bg-green-50 text-gray-300 hover:text-green-600'
                      }`}
                      title="실행"
                    >
                      {runningId === a.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiPlay size={14} />
                      )}
                    </button>
                    <button
                      onClick={(e) => remove(a.id, e)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition"
                      title="삭제"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 group-hover:text-baikal-700 transition">{a.name}</h3>
                
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${TYPE_COLORS[a.type]}`}>
                    {TYPE_LABELS[a.type] || a.type}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    a.schedule_enabled ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}>
                    {a.schedule_enabled ? `⏱ ${a.schedule_cron}` : '수동 실행'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <FiClock size={11} />
                    <span className="text-[10px]">{new Date(a.created_at).toLocaleDateString('ko')}</span>
                  </div>
                  <FiArrowRight size={14} className="text-gray-300 group-hover:text-baikal-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
