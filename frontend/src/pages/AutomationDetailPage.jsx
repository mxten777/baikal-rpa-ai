import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { FiPlay, FiRefreshCw, FiArrowLeft, FiCpu, FiGlobe, FiGrid, FiClock, FiSettings, FiList, FiChevronDown, FiChevronUp, FiTerminal, FiCheckCircle, FiXCircle, FiLoader, FiPause } from 'react-icons/fi'

const STATUS_STYLES = {
  queued: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: FiPause, label: '대기 중' },
  running: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: FiLoader, label: '실행 중' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: FiCheckCircle, label: '성공' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: FiXCircle, label: '실패' },
}

export default function AutomationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [auto, setAuto] = useState(null)
  const [runs, setRuns] = useState([])
  const [expandedRun, setExpandedRun] = useState(null)
  const [runLoading, setRunLoading] = useState(false)

  const loadAuto = () => api.get(`/automations/${id}`).then((r) => setAuto(r.data)).catch(() => navigate('/automations'))
  const loadRuns = () => api.get(`/automations/${id}/runs`).then((r) => setRuns(r.data)).catch(() => {})

  useEffect(() => { loadAuto(); loadRuns() }, [id])

  const runNow = async () => {
    setRunLoading(true)
    try {
      await api.post(`/automations/${id}/run`)
      toast.success('자동화 실행이 시작되었습니다')
      setTimeout(() => { loadRuns(); setRunLoading(false) }, 1500)
    } catch {
      toast.error('실행에 실패했습니다')
      setRunLoading(false)
    }
  }

  if (!auto) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-baikal-600 rounded-full animate-spin mr-2" />
        불러오는 중...
      </div>
    )
  }

  const TypeIcon = auto.type === 'web_scrape' ? FiGlobe : FiGrid
  const typeColor = auto.type === 'web_scrape' ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'
  const successRuns = runs.filter((r) => r.status === 'success').length
  const failedRuns = runs.filter((r) => r.status === 'failed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/automations')} className="text-xs text-gray-400 hover:text-baikal-600 flex items-center gap-1 mb-3 transition">
          <FiArrowLeft size={12} /> 자동화 목록
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${typeColor} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <TypeIcon size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{auto.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                  auto.type === 'web_scrape' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {auto.type === 'web_scrape' ? '웹 수집' : '엑셀 처리'}
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                  auto.schedule_enabled ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                }`}>
                  {auto.schedule_enabled ? `⏱ ${auto.schedule_cron}` : '수동 실행'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { loadRuns(); toast.success('새로고침 완료') }}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              <FiRefreshCw size={14} /> <span className="hidden sm:inline">새로고침</span>
            </button>
            <button
              onClick={runNow}
              disabled={runLoading}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
            >
              {runLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiPlay size={14} />
              )}
              <span className="hidden sm:inline">지금 실행</span><span className="sm:hidden">실행</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-400 mb-1">전체 실행</div>
          <div className="text-2xl font-bold text-gray-900">{runs.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-400 mb-1">성공</div>
          <div className="text-2xl font-bold text-emerald-600">{successRuns}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-400 mb-1">실패</div>
          <div className="text-2xl font-bold text-red-500">{failedRuns}</div>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b bg-gray-50/50 flex items-center gap-2">
          <FiSettings size={14} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-600">설정 정보</span>
        </div>
        <div className="p-5">
          <div className="bg-gray-900 rounded-xl p-4 overflow-auto">
            <pre className="text-xs text-gray-300 font-mono">{JSON.stringify(auto.config, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Runs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiList size={14} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">실행 기록</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{runs.length}건</span>
          </div>
        </div>
        
        {runs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FiClock className="mx-auto text-gray-200 mb-3" size={32} />
            <p className="text-gray-400 text-sm font-medium">실행 기록이 없습니다</p>
            <p className="text-gray-300 text-xs mt-1">"지금 실행" 버튼을 눌러 자동화를 시작하세요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {runs.map((r, idx) => {
              const style = STATUS_STYLES[r.status] || STATUS_STYLES.queued
              const StatusIcon = style.icon
              const isExpanded = expandedRun === r.id

              return (
                <div key={r.id} className="hover:bg-gray-50/50 transition">
                  <button
                    onClick={() => setExpandedRun(isExpanded ? null : r.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 text-left"
                  >
                    <div className="text-xs text-gray-300 w-6 text-center font-mono">#{runs.length - idx}</div>
                    <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${style.bg} ${style.text} ${style.border}`}>
                      <StatusIcon size={12} className={r.status === 'running' ? 'animate-spin' : ''} />
                      {style.label}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">
                        {r.started_at ? new Date(r.started_at).toLocaleString('ko') : '시작 대기 중'}
                      </div>
                    </div>
                    {r.finished_at && r.started_at && (
                      <span className="text-[10px] text-gray-400">
                        {((new Date(r.finished_at) - new Date(r.started_at)) / 1000).toFixed(1)}초
                      </span>
                    )}
                    {isExpanded ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-3 ml-10">
                      {r.log && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
                            <FiTerminal size={10} /> 실행 로그
                          </div>
                          <div className="bg-gray-900 rounded-xl p-4">
                            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{r.log}</pre>
                          </div>
                        </div>
                      )}
                      {r.result_payload && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">결과 데이터</div>
                          <div className="bg-gray-900 rounded-xl p-4 overflow-auto max-h-60">
                            <pre className="text-xs text-gray-300 font-mono">{JSON.stringify(r.result_payload, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                      {!r.log && !r.result_payload && (
                        <p className="text-xs text-gray-400">상세 데이터 없음</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
