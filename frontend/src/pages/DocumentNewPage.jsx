import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { FiFileText, FiSend, FiCopy, FiDownload, FiArrowLeft, FiCheck, FiZap, FiFile, FiSparkles } from 'react-icons/fi'

const DOC_TYPE_OPTIONS = [
  { value: 'report', label: '보고서', desc: '업무 보고서, 실적 보고서 등', icon: '📊', color: 'from-blue-500 to-indigo-600' },
  { value: 'official', label: '공문', desc: '공식 문서, 협조 요청 등', icon: '📄', color: 'from-purple-500 to-violet-600' },
  { value: 'email', label: '이메일', desc: '비즈니스 이메일 작성', icon: '✉️', color: 'from-amber-500 to-orange-600' },
]

const TEMPLATES = {
  report: [
    '2025년 1분기 실적 보고서를 작성해줘. 매출, 영업이익, 주요 성과를 포함.',
    '신규 프로젝트 진행 현황 보고서. 일정, 예산, 리스크를 정리.',
    '월간 팀 업무 보고서. 완료 과제, 진행 과제, 이슈 사항 포함.',
  ],
  official: [
    '타 부서에 협조를 요청하는 공문. 데이터 제공 관련.',
    '외부 기관에 보내는 사업 제안 공문.',
    '사내 정책 변경 안내 공문.',
  ],
  email: [
    '거래처에 미팅 일정을 요청하는 비즈니스 이메일.',
    '프로젝트 완료 보고 이메일. 성과와 결과 요약.',
    '감사 인사와 함께 후속 협의를 요청하는 이메일.',
  ],
}

export default function DocumentNewPage() {
  const navigate = useNavigate()
  const [docType, setDocType] = useState('report')
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/docs/generate', {
        doc_type: docType,
        title,
        content_prompt: prompt,
      })
      setResult(data)
      toast.success('문서가 AI에 의해 성공적으로 생성되었습니다!')
    } catch {
      toast.error('문서 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result?.output_content) return
    navigator.clipboard.writeText(result.output_content)
    setCopied(true)
    toast.success('클립보드에 복사 완료')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadResult = () => {
    if (!result?.output_content) return
    const blob = new Blob([result.output_content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'document'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 stagger">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/documents')} className="text-xs text-gray-400 hover:text-baikal-600 flex items-center gap-1 mb-3 transition group">
            <FiArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" /> 문서 목록
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <FiZap size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI 문서 생성</h1>
              <p className="text-xs text-gray-400 mt-0.5">AI가 자동으로 전문적인 문서를 작성합니다</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Form - Left 2 cols */}
        <form onSubmit={generate} className="lg:col-span-2 space-y-5">
          {/* Document Type Selection */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">문서 유형 선택</label>
            <div className="space-y-2">
              {DOC_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDocType(opt.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all group ${
                    docType === opt.value
                      ? 'border-baikal-500 bg-baikal-50 ring-4 ring-baikal-500/10'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-[11px] text-gray-400">{opt.desc}</div>
                  </div>
                  {docType === opt.value && (
                    <div className="w-5 h-5 rounded-full bg-baikal-500 flex items-center justify-center shrink-0">
                      <FiCheck className="text-white" size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Prompt */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">문서 제목</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-baikal-500/20 focus:border-baikal-400 outline-none transition"
                placeholder="예: 2025년 1분기 실적 보고서"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">내용 지시</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                rows={4}
                className="w-full border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-baikal-500/20 focus:border-baikal-400 outline-none transition"
                placeholder="AI에게 어떤 내용을 작성할지 자세히 알려주세요..."
              />
              <div className="text-right mt-1">
                <span className={`text-[10px] ${prompt.length > 0 ? 'text-baikal-500' : 'text-gray-300'}`}>{prompt.length}자</span>
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="text-[11px] text-gray-400 mb-2 block flex items-center gap-1">
                <FiSparkles size={10} /> 빠른 템플릿
              </label>
              <div className="space-y-1.5">
                {(TEMPLATES[docType] || []).map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(t)}
                    className={`w-full text-left text-xs p-2.5 rounded-xl border-2 transition-all truncate ${
                      prompt === t
                        ? 'text-baikal-600 bg-baikal-50 border-baikal-200'
                        : 'text-gray-500 hover:text-baikal-600 hover:bg-baikal-50/50 border-gray-100 hover:border-baikal-100'
                    }`}
                  >
                    💡 {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-baikal-600 to-baikal-700 hover:from-baikal-500 hover:to-baikal-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI가 문서를 작성하고 있습니다...
                </>
              ) : (
                <>
                  <FiZap size={16} /> AI로 문서 생성
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preview - Right 3 cols */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
            <div className="flex items-center justify-between px-5 py-3.5 border-b bg-gray-50/50">
              <div className="flex items-center gap-2">
                <FiFile size={14} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-600">문서 미리보기</span>
                {result && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">생성 완료</span>}
              </div>
              {result && (
                <div className="flex items-center gap-1">
                  <button onClick={copyResult} className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-gray-100 rounded-lg text-xs text-gray-500 hover:text-gray-700 transition" title="복사">
                    {copied ? <FiCheck size={13} className="text-green-500" /> : <FiCopy size={13} />}
                    <span className="hidden sm:inline">{copied ? '복사됨' : '복사'}</span>
                  </button>
                  <button onClick={downloadResult} className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-gray-100 rounded-lg text-xs text-gray-500 hover:text-gray-700 transition" title="다운로드">
                    <FiDownload size={13} />
                    <span className="hidden sm:inline">다운로드</span>
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 overflow-auto max-h-[calc(100vh-16rem)]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-baikal-100 to-baikal-50 flex items-center justify-center">
                      <FiZap size={22} className="text-baikal-500 animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-baikal-500 rounded-full animate-ping opacity-40" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">AI가 문서를 작성하고 있어요</p>
                    <p className="text-xs text-gray-400 mt-1">잠시만 기다려주세요...</p>
                  </div>
                  <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="progress-bar h-full bg-gradient-to-r from-baikal-400 to-baikal-600 rounded-full" />
                  </div>
                </div>
              ) : result ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 animate-fade-in">
                  <ReactMarkdown>{result.output_content}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <FiFileText size={28} className="text-gray-200" />
                  </div>
                  <p className="text-sm font-medium text-gray-400">미리보기 영역</p>
                  <p className="text-xs text-gray-300 mt-1">문서를 생성하면 여기에 표시됩니다</p>
                  <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                    왼쪽에서 유형과 지시사항을 입력 후 생성 버튼을 클릭하세요
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
