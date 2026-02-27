import { useState, useRef, useEffect } from 'react'
import api from '../api'
import ReactMarkdown from 'react-markdown'
import { FiSend, FiTrash2, FiCopy, FiCheck, FiZap, FiFileText, FiMail, FiClipboard, FiMessageCircle, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  { icon: FiFileText, label: '보고서 작성', prompt: '2025년 1분기 실적 보고서를 작성해줘. 매출 증가율과 주요 성과를 포함해줘.' },
  { icon: FiMail, label: '이메일 작성', prompt: '거래처에 보내는 미팅 요청 이메일을 작성해줘. 정중한 비즈니스 톤으로 부탁해.' },
  { icon: FiClipboard, label: '회의록 정리', prompt: '오늘 회의 내용을 정리해줘. 참석자, 안건, 결정사항, 후속 액션을 구분해서.' },
  { icon: FiZap, label: '업무 자동화', prompt: '반복적인 데이터 수집 업무를 자동화하려고 해. 어떤 방법이 좋을지 알려줘.' },
]

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    const userMsg = { role: 'user', content: msg, time: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const { data } = await api.post('/ai/chat', { message: msg, history })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, time: new Date() }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ AI 응답 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', time: new Date() }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyContent = (content, idx) => {
    navigator.clipboard.writeText(content)
    setCopiedIdx(idx)
    toast.success('복사 완료')
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const clearChat = () => {
    if (messages.length === 0) return
    setMessages([])
    toast.success('대화 초기화 완료')
  }

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-7.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <FiMessageCircle size={14} />
            </div>
            AI 업무 도우미
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 ml-9 sm:ml-10 hidden sm:block">업무 관련 질문, 문서 작성, 아이디어 회의 등 무엇이든 물어보세요</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-red-50 transition shrink-0">
            <FiTrash2 size={12} />
            <span className="hidden sm:inline">대화 초기화</span>
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-baikal-500 to-baikal-700 flex items-center justify-center text-white mb-5 shadow-lg shadow-baikal-500/20">
              <FiZap size={28} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">무엇을 도와드릴까요?</h2>
            <p className="text-sm text-gray-400 mb-8 text-center">AI가 업무를 도와드립니다. 아래 제안 중 하나를 선택하거나 자유롭게 질문하세요.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.prompt)}
                  className="group text-left bg-gray-50 hover:bg-baikal-50 border border-gray-100 hover:border-baikal-200 rounded-xl p-4 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <s.icon size={14} className="text-baikal-500" />
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-baikal-700">{s.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 group-hover:text-gray-500 line-clamp-2">{s.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-baikal-500 to-baikal-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    AI
                  </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[75%] group ${m.role === 'user' ? '' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-baikal-600 text-white rounded-br-md'
                        : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                  <div className={`mt-1 flex items-center gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-gray-300">{formatTime(m.time)}</span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => copyContent(m.content, i)}
                        className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="복사"
                      >
                        {copiedIdx === i ? <FiCheck size={11} className="text-green-500" /> : <FiCopy size={11} />}
                      </button>
                    )}
                  </div>
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0 mt-0.5">
                    나
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-baikal-500 to-baikal-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  AI
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-baikal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-baikal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-baikal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400 ml-1">답변 생성 중...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-2 sm:mt-3 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm focus-within:border-baikal-400 focus-within:shadow-md transition-all">
        <div className="flex items-end gap-2 p-1.5 sm:p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 resize-none outline-none text-sm max-h-32 min-h-[2.5rem]"
            style={{ overflow: input.split('\n').length > 1 ? 'auto' : 'hidden' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-baikal-600 hover:bg-baikal-700 text-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition disabled:opacity-30 disabled:hover:bg-baikal-600 shrink-0"
          >
            <FiSend size={16} />
          </button>
        </div>
        <div className="px-3 sm:px-4 pb-1.5 sm:pb-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-300 hidden sm:inline">AI 답변은 참고용이며 중요한 결정 시 확인이 필요합니다</span>
          <span className="text-[10px] text-gray-300">{input.length > 0 ? `${input.length}자` : ''}</span>
        </div>
      </div>
    </div>
  )
}
