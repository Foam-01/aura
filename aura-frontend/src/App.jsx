import { useState } from 'react';
import { searchUserAcrossSystems } from './services/search.service';

function App() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await searchUserAcrossSystems(keyword);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Header Container */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 tracking-tighter">
              A
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AURA <span className="text-emerald-400 font-medium text-sm px-1.5 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 ml-1">Enterprise</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Bar Section */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-4">
            Unified Accounts Directory
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8">
            สืบค้นข้อมูลและสิทธิ์การเข้าใช้งานของพนักงานขนานพร้อมกัน 8 ระบบหลักในเครือ AIRA
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-2xl focus-within:border-emerald-500/50 transition-all duration-200">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้ หรือรหัสพนักงาน (เช่น admin, 0001, 0013)"
              className="flex-1 bg-transparent px-4 py-2.5 text-white placeholder-slate-500 font-medium focus:outline-none w-full"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-lg shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all duration-150 flex items-center justify-center min-w-[100px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'ค้นหา'
              )}
            </button>
          </form>
        </div>

        {/* Results Section Grid */}
        {searched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((item, idx) => {
              const isActive = item.status === 'ACTIVE';
              const isOffline = item.status === 'OFFLINE';
              const isNotFound = item.status === 'NOT_FOUND';

              return (
                <div 
                  key={idx} 
                  className={`relative overflow-hidden p-5 rounded-xl border transition-all duration-300 ${
                    isActive ? 'bg-slate-900/40 border-emerald-500/30 shadow-lg shadow-emerald-500/[0.02]' :
                    isOffline ? 'bg-slate-900/20 border-red-500/30 animate-pulse' :
                    'bg-slate-900/10 border-slate-900 opacity-60'
                  }`}
                >
                  {/* Status Indicator Bar at top */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${
                    isActive ? 'bg-emerald-500' :
                    isOffline ? 'bg-red-500' : 'bg-slate-800'
                  }`} />

                  {/* Top System Header */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-xs tracking-wider uppercase text-slate-400">{item.system}</span>
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md font-extrabold border ${
                      isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      isOffline ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}>{item.status}</span>
                  </div>

                  {/* Username Display */}
                  <p className="text-2xl font-black tracking-tight text-white mb-1">
                    {isOffline || isNotFound ? '-' : item.username}
                  </p>
                  
                  {/* Role Display */}
                  <div className="flex items-center gap-1.5 mb-4 text-slate-400 text-xs">
                    <span className="text-slate-500">Role:</span>
                    <span className={isActive ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                      {item.role}
                    </span>
                  </div>

                  {/* Meta Details Box */}
                  {item.details && Object.keys(item.details).length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-900/60 text-[11px] text-slate-500 space-y-1">
                      {Object.entries(item.details).map(([key, val]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize text-slate-600">{key}:</span>
                          <span className="text-slate-400 font-mono truncate max-w-[140px]">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;