import { useState, useRef, useEffect } from 'react'
import api from '../api'
import ReactMarkdown from 'react-markdown'
import { FiSend, FiTrash2, FiCopy, FiCheck, FiZap, FiFileText, FiMail, FiClipboard, FiMessageCircle, FiRefreshCw, FiChevronDown, FiSparkles } from 'react-icons/fi'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  { icon: FiFileText, label: '보고서 작성', prompt: '2025년 1분기 실적 보고서를 작성해줘. 매출 증가율과 주요 성과를 포함해줘.', color: 'from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border-blue-100' },
  { icon: FiMail, label: '이메일 작성', prompt: '거래처에 보내는 미팅 요청 이메일을 작성해줘. 정중한 비즈니스 톤으로 부탁해.', color: 'from-emerald-500/10 to-emerald-600/10 hover:from-emerald-500/20 hover:to-emerald-600/20 border-emerald-100' },
  { icon: FiClipboard, label: '회의록 정리', prompt: '오늘 회의 내용을 정리해줘. 참석자, 안건, 결정사항, 후속 액션을 구분해서.', color: 'from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 border-purple-100' },
  { icon: FiZap, label: '업무 자동화', prompt: '반복적인 데이터 수집 업무를 자동화하려고 해. 어떤 방법이 좋을지 알려줘.', color: 'from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border-amber-100' },
]

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [showScroll, setShowScroll] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const chatRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Show scroll-to-bottom button
  useEffect(() => {
    const el = chatRef.current
    if (!el) return
    const onScroll = () => setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 100)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

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

  const regenerate = async (idx) => {
    // Find the last user message before this assistant message
    const lastUserMsg = messages.slice(0, idx).reverse().find(m => m.role === 'user')
    if (!lastUserMsg) return
    // Remove the assistant message
    const newMessages = messages.filter((_, i) => i !== idx)
    setMessages(newMessages)
    setLoading(true)
    try {
      const history = newMessages.map((m) => ({ role: m.role, content: m.content }))
      const { data } = await api.post('/ai/chat', { message: lastUserMsg.content, history })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, time: new Date() }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ 재생성 중 오류가 발생했습니다.', time: new Date() }])
    } finally {
      setLoading(false)
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
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
              <FiMessageCircle size={14} />
            </div>
            AI 업무 도우미
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 ml-9 sm:ml-10 hidden sm:block">업무 관련 질문, 문서 작성, 아이디어 회의 등 무엇이든 물어보세요</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <span className="text-[10px] text-gray-400 hidden sm:block">{messages.length}개 메시지</span>
          )}
          {messages.length > 0 && (
            <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition shrink-0">
              <FiTrash2 size={12} />
              <span className="hidden sm:inline">초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatRef} className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-sm relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-baikal-500 to-baikal-700 flex items-center justify-center text-white mb-5 shadow-xl shadow-baikal-500/20 animate-float">
              <FiZap size={28} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">무엇을 도와드릴까요?</h2>
            <p className="text-sm text-gray-400 mb-8 text-center max-w-md">AI가 업무를 도와드립니다. 아래 제안 중 하나를 선택하거나 자유롭게 질문하세요.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.prompt)}
                  className={`group text-left bg-gradient-to-br ${s.color} border rounded-2xl p-4 transition-all duration-300 card-hover`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
                      <s.icon size={13} className="text-baikal-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-baikal-700">{s.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 line-clamp-2 leading-relaxed">{s.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 animate-slide-up ${m.role === 'user' ? 'justify-end' : 'justify-start'}`} style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-baikal-500 to-baikal-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-md shadow-baikal-500/15">
                    AI
                  </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[75%] group`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-baikal-600 to-baikal-700 text-white rounded-br-md shadow-md shadow-baikal-600/15'
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
                  <div className={`mt-1.5 flex items-center gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-gray-300">{formatTime(m.time)}</span>
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyContent(m.content, i)}
                          className="text-gray-300 hover:text-gray-500 p-1 rounded hover:bg-gray-100 transition"
                          title="복사"
                        >
                          {copiedIdx === i ? <FiCheck size={11} className="text-green-500" /> : <FiCopy size={11} />}
                        </button>
                        <button
                          onClick={() => regenerate(i)}
                          className="text-gray-300 hover:text-baikal-500 p-1 rounded hover:bg-baikal-50 transition"
                          title="재생성"
                        >
                          <FiRefreshCw size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0 mt-0.5">
                    나
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-baikal-500 to-baikal-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-md shadow-baikal-500/15">
                  AI
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-baikal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-baikal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-baikal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400 ml-1">AI가 생각하고 있어요...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScroll && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-4 right-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg text-gray-500 hover:text-baikal-600 transition animate-fade-in"
          >
            <FiChevronDown size={16} />
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-2 sm:mt-3 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm focus-within:border-baikal-400 focus-within:shadow-md focus-within:shadow-baikal-500/5 transition-all">
        <div className="flex items-end gap-2 p-1.5 sm:p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 resize-none outline-none text-sm max-h-32 min-h-[2.5rem]"
            style={{ overflow: input.split('\n').length > 1 ? 'auto' : 'hidden' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-baikal-600 to-baikal-700 hover:from-baikal-500 hover:to-baikal-600 text-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all disabled:opacity-30 disabled:hover:from-baikal-600 shrink-0 shadow-sm hover:shadow-md active:scale-95"
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
