import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { FiFileText, FiSend, FiCopy, FiDownload, FiArrowLeft, FiCheck, FiZap, FiFile } from 'react-icons/fi'

const DOC_TYPE_OPTIONS = [
  { value: 'report', label: '보고서', desc: '업무 보고서, 실적 보고서 등', icon: '📊' },
  { value: 'official', label: '공문', desc: '공식 문서, 협조 요청 등', icon: '📄' },
  { value: 'email', label: '이메일', desc: '비즈니스 이메일 작성', icon: '✉️' },
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/documents')} className="text-xs text-gray-400 hover:text-baikal-600 flex items-center gap-1 mb-2 transition">
            <FiArrowLeft size={12} /> 문서 목록
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
              <FiZap size={16} />
            </div>
            AI 문서 생성
          </h1>
          <p className="text-xs text-gray-400 mt-1 ml-10">AI가 자동으로 전문적인 문서를 작성합니다</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Form - Left 2 cols */}
        <form onSubmit={generate} className="lg:col-span-2 space-y-5">
          {/* Document Type Selection */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">문서 유형 선택</label>
            <div className="space-y-2">
              {DOC_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDocType(opt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                    docType === opt.value
                      ? 'border-baikal-500 bg-baikal-50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-[11px] text-gray-400">{opt.desc}</div>
                  </div>
                  {docType === opt.value && <FiCheck className="ml-auto text-baikal-500" size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Prompt */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">문서 제목</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none"
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none"
                placeholder="AI에게 어떤 내용을 작성할지 자세히 알려주세요..."
              />
            </div>

            {/* Quick Templates */}
            <div>
              <label className="text-[11px] text-gray-400 mb-2 block">빠른 템플릿</label>
              <div className="space-y-1.5">
                {(TEMPLATES[docType] || []).map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(t)}
                    className="w-full text-left text-xs text-gray-500 hover:text-baikal-600 hover:bg-baikal-50 p-2 rounded-lg border border-gray-100 hover:border-baikal-200 transition truncate"
                  >
                    💡 {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-baikal-600 to-baikal-700 hover:from-baikal-700 hover:to-baikal-800 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50/50">
              <div className="flex items-center gap-2">
                <FiFile size={14} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">문서 미리보기</span>
              </div>
              {result && (
                <div className="flex items-center gap-1">
                  <button onClick={copyResult} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition" title="복사">
                    {copied ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
                  </button>
                  <button onClick={downloadResult} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition" title="다운로드">
                    <FiDownload size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 overflow-auto max-h-[calc(100vh-16rem)]">
              {result ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                  <ReactMarkdown>{result.output_content}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                  <FiFileText size={40} className="mb-3" />
                  <p className="text-sm font-medium text-gray-400">미리보기 영역</p>
                  <p className="text-xs text-gray-300 mt-1">문서를 생성하면 여기에 표시됩니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
