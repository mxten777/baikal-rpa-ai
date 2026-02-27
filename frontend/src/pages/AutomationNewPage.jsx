import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { FiCpu, FiGlobe, FiGrid, FiArrowLeft, FiCheck, FiClock, FiZap, FiInfo } from 'react-icons/fi'

const TYPE_OPTIONS = [
  { value: 'web_scrape', label: '웹사이트 데이터 수집', desc: '웹페이지에서 데이터를 자동 수집합니다', icon: FiGlobe, color: 'from-blue-500 to-indigo-600' },
  { value: 'excel_process', label: '엑셀 자동 처리', desc: '엑셀 파일을 자동으로 정리·분석합니다', icon: FiGrid, color: 'from-emerald-500 to-teal-600' },
]

const CRON_PRESETS = [
  { label: '매일 오전 9시', value: '0 9 * * *' },
  { label: '매일 새벽 3시', value: '0 3 * * *' },
  { label: '매주 월요일 9시', value: '0 9 * * 1' },
  { label: '매월 1일 9시', value: '0 9 1 * *' },
]

const OP_LABELS = {
  dropna: { label: '빈 값 제거', desc: '비어있는 셀이 있는 행을 삭제합니다' },
  dedup: { label: '중복 제거', desc: '중복된 행을 제거합니다' },
  sort: { label: '정렬', desc: '데이터를 오름차순으로 정렬합니다' },
  summary: { label: '요약 통계', desc: '수치 데이터의 통계 요약을 생성합니다' },
}

export default function AutomationNewPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [type, setType] = useState('web_scrape')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleCron, setScheduleCron] = useState('')

  // web_scrape config
  const [url, setUrl] = useState('')
  const [selector, setSelector] = useState('body')
  const [extract, setExtract] = useState('text')

  // excel_process config
  const [filePath, setFilePath] = useState('')
  const [operations, setOperations] = useState(['summary'])

  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const config =
        type === 'web_scrape'
          ? { url, selector, extract }
          : { file_path: filePath, operations }

      await api.post('/automations/', {
        name,
        type,
        config,
        schedule_enabled: scheduleEnabled,
        schedule_cron: scheduleEnabled ? scheduleCron : null,
      })
      toast.success('자동화가 성공적으로 등록되었습니다!')
      navigate('/automations')
    } catch {
      toast.error('등록에 실패했습니다. 설정을 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/automations')} className="text-xs text-gray-400 hover:text-baikal-600 flex items-center gap-1 mb-2 transition">
          <FiArrowLeft size={12} /> 자동화 목록
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
            <FiZap size={16} />
          </div>
          새 자동화 등록
        </h1>
        <p className="text-xs text-gray-400 mt-1 ml-10">반복 업무를 자동화하여 생산성을 높이세요</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Name */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">자동화 이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none"
            placeholder="예: 공공데이터 포털 수집, 월간 매출 엑셀 정리"
          />
        </div>

        {/* Type selection */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">자동화 유형</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                  type === opt.value
                    ? 'border-baikal-500 bg-baikal-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center text-white shrink-0`}>
                  <opt.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</div>
                </div>
                {type === opt.value && <FiCheck className="text-baikal-500 shrink-0" size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Type-specific config */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
            상세 설정
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-normal">
              {type === 'web_scrape' ? '웹 수집' : '엑셀 처리'}
            </span>
          </label>

          {type === 'web_scrape' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">수집 대상 URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none"
                  placeholder="https://example.com/data"
                />
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <FiInfo size={10} /> 데이터를 수집할 웹페이지의 전체 URL을 입력하세요
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">CSS Selector</label>
                <input
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none"
                  placeholder="table, .data-container, #content"
                />
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <FiInfo size={10} /> 수집할 영역의 CSS selector (기본: body 전체)
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">추출 방식</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'text', label: '텍스트', desc: '순수 텍스트' },
                    { value: 'html', label: 'HTML', desc: 'HTML 코드' },
                    { value: 'table', label: '테이블', desc: '표 데이터' },
                  ].map((e) => (
                    <button
                      key={e.value}
                      type="button"
                      onClick={() => setExtract(e.value)}
                      className={`p-3 rounded-xl border-2 text-center transition ${
                        extract === e.value
                          ? 'border-baikal-500 bg-baikal-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="text-sm font-medium">{e.label}</div>
                      <div className="text-[10px] text-gray-400">{e.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">엑셀 파일 경로</label>
                <input
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none"
                  placeholder="uploads/파일명.xlsx"
                />
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <FiInfo size={10} /> 처리할 엑셀 파일의 경로를 입력하세요 (업로드 후 경로 자동 반영)
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">처리 작업 선택</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(OP_LABELS).map(([op, info]) => (
                    <label
                      key={op}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                        operations.includes(op)
                          ? 'border-baikal-500 bg-baikal-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={operations.includes(op)}
                        onChange={(e) => {
                          setOperations((prev) =>
                            e.target.checked ? [...prev, op] : prev.filter((o) => o !== op)
                          )
                        }}
                        className="w-4 h-4 text-baikal-600 rounded border-gray-300 focus:ring-baikal-500"
                      />
                      <div>
                        <div className="text-sm font-medium">{info.label}</div>
                        <div className="text-[10px] text-gray-400">{info.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiClock size={14} className="text-gray-400" />
                정기 실행 스케줄
              </label>
              <p className="text-[11px] text-gray-400 mt-0.5">특정 시간에 자동으로 실행되도록 설정합니다</p>
            </div>
            <button
              type="button"
              onClick={() => setScheduleEnabled(!scheduleEnabled)}
              className={`relative w-11 h-6 rounded-full transition ${scheduleEnabled ? 'bg-baikal-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${scheduleEnabled ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}
                style={{ transform: scheduleEnabled ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>
          {scheduleEnabled && (
            <div className="mt-4 space-y-3">
              <input
                value={scheduleCron}
                onChange={(e) => setScheduleCron(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none"
                placeholder="0 9 * * * (분 시 일 월 요일)"
              />
              <div className="flex flex-wrap gap-2">
                {CRON_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setScheduleCron(p.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      scheduleCron === p.value
                        ? 'border-baikal-500 bg-baikal-50 text-baikal-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-baikal-600 to-baikal-700 hover:from-baikal-700 hover:to-baikal-800 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              등록 중...
            </>
          ) : (
            <>
              <FiCpu size={16} /> 자동화 등록
            </>
          )}
        </button>
      </form>
    </div>
  )
}
