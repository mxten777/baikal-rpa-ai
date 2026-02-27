import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight, FiCpu, FiFileText, FiMessageSquare, FiShield, FiZap } from 'react-icons/fi'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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
      {/* Left - Branding with animated background */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-baikal-800 via-baikal-900 to-baikal-950 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-baikal-700/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-baikal-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        {/* Glowing lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-baikal-400/20 to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-baikal-500/10 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20">
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-gradient-to-br from-baikal-400 to-baikal-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-2xl shadow-baikal-500/30 animate-glow">
                B
              </div>
              <div>
                <div className="text-white text-xl font-bold tracking-wide">BAIKAL RPA AI</div>
                <div className="text-baikal-400 text-[10px] tracking-[0.2em] uppercase">Enterprise Automation Platform</div>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              AI와 함께하는<br />
              <span className="gradient-text">스마트 업무 자동화</span>
            </h2>
            <p className="text-baikal-300/80 text-sm leading-relaxed max-w-md mb-12">
              BAIKAL RPA AI는 AI 도우미, 문서 자동 생성, 업무 자동화(RPA)를 하나의 플랫폼에서 제공합니다.
              반복적인 업무를 자동화하고, AI의 도움으로 더 빠르게 일하세요.
            </p>
          </div>

          <div className="space-y-3 stagger">
            {[
              { icon: FiMessageSquare, title: 'AI 업무 도우미', desc: '자연어로 업무 질문 및 요청', color: 'from-blue-500/20 to-blue-600/20' },
              { icon: FiFileText, title: '문서 자동 생성', desc: '보고서, 공문, 이메일 AI 작성', color: 'from-emerald-500/20 to-emerald-600/20' },
              { icon: FiCpu, title: 'RPA 업무 자동화', desc: '웹 수집, 엑셀 처리 자동 실행', color: 'from-purple-500/20 to-purple-600/20' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.06] transition-all duration-300 group card-hover">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={18} className="text-baikal-300" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{f.title}</div>
                  <div className="text-baikal-400/70 text-xs mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className={`mt-12 flex items-center gap-6 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 text-baikal-400/60 text-xs">
              <FiShield size={14} />
              <span>엔터프라이즈 보안</span>
            </div>
            <div className="flex items-center gap-2 text-baikal-400/60 text-xs">
              <FiZap size={14} />
              <span>실시간 처리</span>
            </div>
            <div className="flex items-center gap-2 text-baikal-400/60 text-xs">
              <FiCpu size={14} />
              <span>AI 기반 자동화</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-6 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, #338dff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-baikal-400 to-baikal-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg animate-glow">
              B
            </div>
            <div className="text-baikal-900 text-lg font-bold">BAIKAL RPA AI</div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8 border border-gray-100/80">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-baikal-500 to-baikal-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-baikal-500/20 lg:hidden">
                <FiLock size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">환영합니다</h1>
              <p className="text-gray-400 mt-2 text-sm">계정에 로그인하여 시작하세요</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
                <div className="relative group">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-baikal-500 transition-colors" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-baikal-500/20 focus:border-baikal-400 outline-none transition-all hover:border-gray-300"
                    placeholder="admin@baikal.ai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
                <div className="relative group">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-baikal-500 transition-colors" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-baikal-500/20 focus:border-baikal-400 outline-none transition-all hover:border-gray-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="animate-fade-in">
                  <div className="flex gap-1.5">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        password.length >= i * 3 
                          ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-blue-400' : 'bg-emerald-400'
                          : 'bg-gray-100'
                      }`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    {password.length < 4 ? '약함' : password.length < 7 ? '보통' : password.length < 10 ? '강함' : '매우 강함'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-baikal-600 to-baikal-700 hover:from-baikal-500 hover:to-baikal-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-baikal-600/25 hover:shadow-baikal-500/30 hover:shadow-xl active:scale-[0.98]"
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

            {/* Demo hint */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-center text-[11px] text-gray-400">
                데모 계정: <span className="font-mono text-gray-500">admin@baikal.ai</span> / <span className="font-mono text-gray-500">admin1234</span>
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-6">
            © 2025 BAIKAL AI Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
