import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight, FiCpu, FiFileText, FiMessageSquare } from 'react-icons/fi'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.access_token)
      toast.success('로그인 성공! 환영합니다.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || '이메일 또는 비밀번호를 확인해주세요')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-baikal-800 via-baikal-900 to-baikal-950 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-baikal-700/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-baikal-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-baikal-400 to-baikal-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-2xl">
              B
            </div>
            <div>
              <div className="text-white text-xl font-bold tracking-wide">BAIKAL RPA AI</div>
              <div className="text-baikal-300 text-xs tracking-wider">업무 자동화 AI 플랫폼</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            AI와 함께하는<br />
            <span className="text-baikal-300">스마트 업무 자동화</span>
          </h2>
          <p className="text-baikal-300 text-sm leading-relaxed max-w-md mb-10">
            BAIKAL RPA AI는 AI 도우미, 문서 자동 생성, 업무 자동화(RPA)를 하나의 플랫폼에서 제공합니다.
            반복적인 업무를 자동화하고, AI의 도움으로 더 빠르게 일하세요.
          </p>

          <div className="space-y-4">
            {[
              { icon: FiMessageSquare, title: 'AI 업무 도우미', desc: '자연어로 업무 질문 및 요청' },
              { icon: FiFileText, title: '문서 자동 생성', desc: '보고서, 공문, 이메일 AI 작성' },
              { icon: FiCpu, title: 'RPA 업무 자동화', desc: '웹 수집, 엑셀 처리 자동 실행' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <f.icon size={18} className="text-baikal-300" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{f.title}</div>
                  <div className="text-baikal-400 text-xs">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-baikal-400 to-baikal-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">
              B
            </div>
            <div className="text-baikal-900 text-lg font-bold">BAIKAL RPA AI</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
              <p className="text-gray-400 mt-2 text-sm">계정 정보를 입력해 주세요</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none transition"
                    placeholder="admin@baikal.ai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-baikal-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-baikal-600 to-baikal-700 hover:from-baikal-700 hover:to-baikal-800 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-baikal-600/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  <>
                    로그인 <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2025 BAIKAL AI Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
