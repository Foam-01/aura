// 🌟 Sidebar Component สำหรับระบบ AURA System
function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-sky-100/80 flex flex-col justify-between p-4 sticky top-0 h-screen shrink-0 z-20">
      <div className="space-y-6">
        {/* Logo Brand */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-7 h-7 rounded-lg bg-sky-400 flex items-center justify-center font-bold text-white text-sm shadow-sm">
            a
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-slate-800">AURA SYSTEM</span>
            <span className="text-[9px] font-bold text-sky-500 uppercase tracking-wider">Core Directory</span>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-2">
            Menu Operations
          </div>
          <a href="#directory" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sky-50 border border-sky-100/50 text-sky-600 font-bold text-xs transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Directory Search
          </a>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all text-left">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2z"></path>
            </svg>
            Dashboard Stats
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all text-left">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            System Controls
          </button>
        </nav>
      </div>

      {/* User Context Footer Sidebar */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600 text-xs uppercase">
          it
        </div>
        <div className="flex flex-col truncate">
          <span className="text-xs font-bold text-slate-700">Administrator</span>
          <span className="text-[10px] text-slate-400 font-mono">Operator Terminal</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;