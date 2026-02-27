import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import {
  FiMessageSquare, FiFileText, FiCpu, FiTrendingUp,
  FiCheckCircle, FiClock, FiArrowRight, FiZap, FiActivity,
  FiServer, FiDatabase, FiWifi, FiPlus, FiArrowUpRight, FiBarChart2
} from 'react-icons/fi'

// Animated counter hook
function useAnimatedCount(target, duration = 600) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (target === '-' || target === undefined) return
    const num = typeof target === 'string' ? parseInt(target) || 0 : target
    if (num === 0) { setCount(0); return }
    let start = 0
    const step = num / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= num) { setCount(num); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [docs, setDocs] = useState([])
  const [autos, setAutos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/auth/me').then((r) => setUser(r.data)).catch(() => {}),
      api.get('/docs/').then((r) => setDocs(r.data)).catch(() => {}),
      api.get('/automations/').then((r) => setAutos(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후에요' : '수고하셨어요'

  const docCount = useAnimatedCount(loading ? 0 : docs.length)
  const autoCount = useAnimatedCount(loading ? 0 : autos.length)

  const statCards = [
    { title: 'AI 대화', value: '-', icon: FiMessageSquare, color: 'from-blue-500 to-blue-600', ring: 'ring-blue-500/10', bgIcon: 'bg-blue-50 text-blue-500', trend: null },
    { title: '문서 생성', value: docs.length, icon: FiFileText, color: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-500/10', bgIcon: 'bg-emerald-50 text-emerald-500', trend: '+' + docs.length },
    { title: '자동화 등록', value: autos.length, icon: FiCpu, color: 'from-purple-500 to-purple-600', ring: 'ring-purple-500/10', bgIcon: 'bg-purple-50 text-purple-500', trend: '+' + autos.length },
    { title: '성공률', value: '100%', icon: FiTrendingUp, color: 'from-amber-500 to-amber-600', ring: 'ring-amber-500/10', bgIcon: 'bg-amber-50 text-amber-500', trend: '100%' },
  ]

  const quickActions = [
    { label: 'AI에게 질문하기', desc: '업무 관련 질문·요청', icon: FiMessageSquare, path: '/ai-assistant', gradient: 'from-blue-500 to-indigo-600', hover: 'hover:shadow-blue-500/15' },
    { label: '보고서 생성', desc: 'AI가 자동 작성', icon: FiFileText, path: '/documents/new', gradient: 'from-emerald-500 to-teal-600', hover: 'hover:shadow-emerald-500/15' },
    { label: '자동화 실행', desc: 'RPA 작업 실행', icon: FiZap, path: '/automations', gradient: 'from-purple-500 to-pink-600', hover: 'hover:shadow-purple-500/15' },
  ]

  const recentDocs = docs.slice(-3).reverse()
  const recentAutos = autos.slice(-3).reverse()

  return (
    <div className="space-y-6 stagger">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-baikal-600 via-baikal-700 to-baikal-800 rounded-2xl p-5 sm:p-7 text-white group">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4 hidden sm:block" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-white/[0.03] rounded-full translate-y-1/2 hidden sm:block" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-baikal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-baikal-200/80 text-xs sm:text-sm">{greeting} 👋</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">{user?.name || '사용자'}님, 환영합니다</h1>
          <p className="text-baikal-200/70 text-xs sm:text-sm mt-2 max-w-lg hidden sm:block">
            BAIKAL RPA AI에서 업무를 더 스마트하게 처리하세요. AI 도우미와 대화하고, 문서를 자동 생성하고, 반복 업무를 자동화할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
            <button onClick={() => navigate('/ai-assistant')} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg active:scale-95">
              <FiMessageSquare size={14} /> AI 도우미 시작
            </button>
            <button onClick={() => navigate('/documents/new')} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg active:scale-95">
              <FiFileText size={14} /> 문서 생성
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s, i) => (
          <div key={s.title} className={`bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 card-hover group ring-1 ${s.ring}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.bgIcon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <s.icon size={18} />
              </div>
              <FiArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all hidden sm:block" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 count-up">
              {loading ? (
                <div className="skeleton h-8 w-16 rounded-lg" />
              ) : s.value === '-' ? '-' : s.title === '성공률' ? '100%' : (
                s.title === '문서 생성' ? docCount : s.title === '자동화 등록' ? autoCount : s.value
              )}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{s.title}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">빠른 시작</h2>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <FiZap size={10} />
            <span>자주 사용하는 기능</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.path}
              className={`group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl ${a.hover} transition-all duration-300 card-hover`}
            >
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-gray-50/50 to-transparent" />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <a.icon size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">{a.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
              </div>
              <FiArrowRight className="absolute top-5 right-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Two columns: Recent docs + Recent automations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm card-hover">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FiFileText className="text-emerald-500" size={13} />
              </div>
              <h3 className="font-semibold text-sm">최근 문서</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{docs.length}</span>
            </div>
            <Link to="/documents" className="text-xs text-baikal-600 hover:text-baikal-700 flex items-center gap-1 font-medium transition">
              전체 보기 <FiArrowRight size={10} />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : recentDocs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <FiFileText className="text-emerald-300" size={22} />
              </div>
              <p className="text-gray-400 font-medium text-sm">생성된 문서가 없습니다</p>
              <Link to="/documents/new" className="inline-flex items-center gap-1 text-baikal-600 text-xs mt-2 hover:underline">
                <FiPlus size={12} /> 새 문서 만들기
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentDocs.map((d) => (
                <div key={d.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/70 transition group cursor-pointer" onClick={() => navigate('/documents')}>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition">
                    <FiFileText size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate group-hover:text-baikal-700 transition">{d.title}</div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {{ report: '보고서', official: '공문', email: '이메일' }[d.doc_type] || d.doc_type}
                      </span>
                      <span>{new Date(d.created_at).toLocaleDateString('ko')}</span>
                    </div>
                  </div>
                  <FiCheckCircle className="text-emerald-400 shrink-0 opacity-0 group-hover:opacity-100 transition" size={14} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Automations */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm card-hover">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                <FiCpu className="text-purple-500" size={13} />
              </div>
              <h3 className="font-semibold text-sm">최근 자동화</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{autos.length}</span>
            </div>
            <Link to="/automations" className="text-xs text-baikal-600 hover:text-baikal-700 flex items-center gap-1 font-medium transition">
              전체 보기 <FiArrowRight size={10} />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : recentAutos.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-purple-50 flex items-center justify-center">
                <FiCpu className="text-purple-300" size={22} />
              </div>
              <p className="text-gray-400 font-medium text-sm">등록된 자동화가 없습니다</p>
              <Link to="/automations/new" className="inline-flex items-center gap-1 text-baikal-600 text-xs mt-2 hover:underline">
                <FiPlus size={12} /> 새 자동화 등록
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentAutos.map((a) => (
                <Link key={a.id} to={`/automations/${a.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/70 transition block group">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-100 transition">
                    <FiCpu size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate group-hover:text-baikal-700 transition">{a.name}</div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {a.type === 'web_scrape' ? '웹 수집' : '엑셀 처리'}
                      </span>
                      <span>{a.schedule_enabled ? `스케줄: ${a.schedule_cron}` : '수동 실행'}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${a.schedule_enabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {a.schedule_enabled ? '자동' : '수동'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <FiActivity size={14} className="text-gray-400" />
            시스템 상태
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-online" />
            모든 시스템 정상
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'API 서버', icon: FiServer, status: 'online' },
            { label: '데이터베이스', icon: FiDatabase, status: 'online' },
            { label: 'AI 엔진', icon: FiActivity, status: 'online' },
            { label: '네트워크', icon: FiWifi, status: 'online' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3 bg-gray-50/70 rounded-xl hover:bg-gray-50 transition group">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:shadow transition">
                <s.icon size={14} className="text-gray-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-700">{s.label}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-online" />
                  <span className="text-[10px] text-green-600 font-medium">정상</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
