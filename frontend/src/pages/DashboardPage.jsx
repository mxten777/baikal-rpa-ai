import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import {
  FiMessageSquare, FiFileText, FiCpu, FiTrendingUp,
  FiCheckCircle, FiClock, FiArrowRight, FiZap, FiActivity,
  FiServer, FiDatabase, FiWifi
} from 'react-icons/fi'

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

  const statCards = [
    { title: 'AI 대화', value: '-', sub: '지난 7일', icon: FiMessageSquare, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50 text-blue-600' },
    { title: '문서 생성', value: docs.length, sub: '전체 문서', icon: FiFileText, color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50 text-emerald-600' },
    { title: '자동화 등록', value: autos.length, sub: '활성 자동화', icon: FiCpu, color: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50 text-purple-600' },
    { title: '성공률', value: '100%', sub: '자동화 실행', icon: FiTrendingUp, color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50 text-amber-600' },
  ]

  const quickActions = [
    { label: 'AI에게 질문하기', desc: '업무 관련 질문·요청', icon: FiMessageSquare, path: '/ai-assistant', gradient: 'from-blue-500 to-indigo-600' },
    { label: '보고서 생성', desc: 'AI가 자동 작성', icon: FiFileText, path: '/documents/new', gradient: 'from-emerald-500 to-teal-600' },
    { label: '자동화 실행', desc: 'RPA 작업 실행', icon: FiZap, path: '/automations', gradient: 'from-purple-500 to-pink-600' },
  ]

  const recentDocs = docs.slice(-3).reverse()
  const recentAutos = autos.slice(-3).reverse()

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-baikal-600 to-baikal-800 rounded-2xl p-4 sm:p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 hidden sm:block" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 hidden sm:block" />
        <div className="relative">
          <p className="text-baikal-200 text-xs sm:text-sm">{greeting}</p>
          <h1 className="text-lg sm:text-2xl font-bold mt-1">{user?.name || '사용자'}님, 환영합니다</h1>
          <p className="text-baikal-200 text-xs sm:text-sm mt-2 max-w-lg hidden sm:block">
            BAIKAL RPA AI에서 업무를 더 스마트하게 처리하세요. AI 도우미와 대화하고, 문서를 자동 생성하고, 반복 업무를 자동화할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
            <button onClick={() => navigate('/ai-assistant')} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <FiMessageSquare size={14} /> AI 도우미 시작
            </button>
            <button onClick={() => navigate('/documents/new')} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <FiFileText size={14} /> 문서 생성
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <div key={s.title} className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${s.bgLight} flex items-center justify-center`}>
                <s.icon size={16} />
              </div>
              <FiArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition hidden sm:block" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{loading ? '...' : s.value}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{s.title} · {s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">빠른 시작</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.path}
              className="group relative overflow-hidden bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <a.icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">{a.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
              <FiArrowRight className="absolute top-5 right-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Two columns: Recent docs + Recent automations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <FiFileText className="text-emerald-500" size={16} />
              <h3 className="font-semibold text-sm">최근 문서</h3>
            </div>
            <Link to="/documents" className="text-xs text-baikal-600 hover:underline flex items-center gap-1">
              전체 보기 <FiArrowRight size={10} />
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              <FiFileText className="mx-auto mb-2" size={24} />
              생성된 문서가 없습니다
              <br />
              <Link to="/documents/new" className="text-baikal-600 hover:underline mt-2 inline-block text-xs">+ 새 문서 만들기</Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentDocs.map((d) => (
                <div key={d.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <FiFileText size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.title}</div>
                    <div className="text-xs text-gray-400">
                      {{ report: '보고서', official: '공문', email: '이메일' }[d.doc_type] || d.doc_type}
                      {' · '}
                      {new Date(d.created_at).toLocaleDateString('ko')}
                    </div>
                  </div>
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={14} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Automations */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <FiCpu className="text-purple-500" size={16} />
              <h3 className="font-semibold text-sm">최근 자동화</h3>
            </div>
            <Link to="/automations" className="text-xs text-baikal-600 hover:underline flex items-center gap-1">
              전체 보기 <FiArrowRight size={10} />
            </Link>
          </div>
          {recentAutos.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              <FiCpu className="mx-auto mb-2" size={24} />
              등록된 자동화가 없습니다
              <br />
              <Link to="/automations/new" className="text-baikal-600 hover:underline mt-2 inline-block text-xs">+ 새 자동화 등록</Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentAutos.map((a) => (
                <Link key={a.id} to={`/automations/${a.id}`} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition block">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                    <FiCpu size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.name}</div>
                    <div className="text-xs text-gray-400">
                      {a.type === 'web_scrape' ? '웹 수집' : '엑셀 처리'}
                      {' · '}{a.schedule_enabled ? `스케줄: ${a.schedule_cron}` : '수동 실행'}
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
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">시스템 상태</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'API 서버', icon: FiServer, status: 'online' },
            { label: '데이터베이스', icon: FiDatabase, status: 'online' },
            { label: 'AI 엔진', icon: FiActivity, status: 'online' },
            { label: '네트워크', icon: FiWifi, status: 'online' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <s.icon size={16} className="text-gray-400" />
              <div>
                <div className="text-xs font-medium text-gray-700">{s.label}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
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
