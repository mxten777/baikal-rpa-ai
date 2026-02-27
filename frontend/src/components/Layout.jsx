import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api'
import {
  FiHome, FiMessageSquare, FiFileText, FiCpu, FiLogOut,
  FiSettings, FiUser, FiBell, FiSearch, FiChevronDown, FiUpload,
  FiMenu, FiX, FiCommand
} from 'react-icons/fi'

const MAIN_NAV = [
  { to: '/', icon: FiHome, label: '대시보드', desc: '전체 현황 보기' },
  { to: '/ai-assistant', icon: FiMessageSquare, label: 'AI 업무 도우미', desc: 'AI와 대화하기' },
  { to: '/documents', icon: FiFileText, label: '문서 관리', desc: '문서 생성·관리' },
  { to: '/automations', icon: FiCpu, label: '업무 자동화', desc: 'RPA 작업 관리' },
]

const BREADCRUMB_MAP = {
  '/': '대시보드',
  '/ai-assistant': 'AI 업무 도우미',
  '/documents': '문서 관리',
  '/documents/new': '새 문서 생성',
  '/automations': '업무 자동화',
  '/automations/new': '새 자동화 등록',
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    api.get('/auth/me').then((r) => setUser(r.data)).catch(() => {})
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const breadcrumb = BREADCRUMB_MAP[location.pathname] || 
    (location.pathname.startsWith('/automations/') ? '자동화 상세' : '')

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 bg-gradient-to-br from-baikal-400 to-baikal-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-baikal-500/20 group-hover:shadow-baikal-400/30 transition-shadow">
            B
          </div>
          <div>
            <div className="text-base font-bold tracking-wide leading-tight">BAIKAL RPA AI</div>
            <div className="text-[9px] text-baikal-400/60 tracking-[0.15em] uppercase">Enterprise Platform</div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-baikal-300 transition">
          <FiX size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-auto">
        <div className="text-[9px] uppercase tracking-[0.15em] text-baikal-500/50 px-3 mb-3 font-semibold">Main Menu</div>
        {MAIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-white/[0.12] text-white shadow-sm' 
                  : 'text-baikal-200/70 hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-baikal-400 rounded-full shadow-[0_0_8px_rgba(51,141,255,0.5)]" />
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-baikal-500/25 text-baikal-300' : 'bg-white/[0.06] group-hover:bg-white/[0.1]'
                }`}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium leading-tight">{item.label}</div>
                  <div className={`text-[10px] truncate transition-colors ${isActive ? 'text-baikal-300/60' : 'text-baikal-400/40 group-hover:text-baikal-300/50'}`}>{item.desc}</div>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-baikal-400 animate-pulse" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="text-[9px] uppercase tracking-[0.15em] text-baikal-500/50 px-3 mt-6 mb-3 font-semibold">Quick Actions</div>
        <button 
          onClick={() => navigate('/documents/new')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-baikal-200/70 hover:bg-white/[0.06] hover:text-white transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500/25 transition">
            <FiFileText size={14} className="text-emerald-400" />
          </div>
          <span>새 문서 생성</span>
        </button>
        <button 
          onClick={() => navigate('/automations/new')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-baikal-200/70 hover:bg-white/[0.06] hover:text-white transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/25 transition">
            <FiCpu size={14} className="text-purple-400" />
          </div>
          <span>새 자동화 등록</span>
        </button>
      </nav>

      {/* User */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.06] transition cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-baikal-400 to-baikal-600 flex items-center justify-center text-xs font-bold shrink-0 shadow-lg shadow-baikal-500/15 ring-2 ring-white/10">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || '사용자'}</div>
            <div className="text-[10px] text-baikal-400/50 truncate">{user?.email || ''}</div>
          </div>
          <FiChevronDown size={14} className={`text-baikal-400/50 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
        </div>
        {showUserMenu && (
          <div className="mt-1 space-y-1 animate-fade-in">
            <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/15 transition">
              <FiLogOut size={14} />
              로그아웃
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-baikal-900 via-baikal-950 to-[#0a1628] text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:shrink-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <FiMenu size={20} />
            </button>
            {/* Mobile: logo, Desktop: breadcrumb */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-baikal-400 to-baikal-600 rounded-md flex items-center justify-center text-white font-black text-[10px]">
                B
              </div>
              <span className="text-sm font-bold text-gray-800">BAIKAL</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-gray-400">홈</span>
              {breadcrumb && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-700 font-medium">{breadcrumb}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search hint */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 cursor-pointer transition border border-gray-100 hover:border-gray-200 text-xs" onClick={() => navigate('/ai-assistant')}>
              <FiSearch size={13} />
              <span>AI에게 물어보기...</span>
              <kbd className="ml-2 px-1.5 py-0.5 bg-white rounded text-[10px] font-mono text-gray-400 border border-gray-200 shadow-sm">⌘K</kbd>
            </div>
            <div className="hidden sm:block text-[11px] text-gray-400">
              {now.toLocaleDateString('ko', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
            </div>
            <div className="hidden sm:block w-px h-5 bg-gray-200" />
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition group">
              <FiBell size={18} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white status-online"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
