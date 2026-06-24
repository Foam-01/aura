import { useState } from 'react';
import { searchUserAcrossSystems } from './services/search.service';
import Sidebar from './components/Sidebar';

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
      
      //  [แก้ไขจุดนี้]: หลังบ้านพ่นมาเป็น { status: 'success', data: [...] } 
      // หน้าบ้านจึงต้องดึงค่าจาก response.data มาลูปเรนเดอร์ลง Card ครับโฟม
      setResults(response.data || []);
      
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf4fc] text-slate-700 font-sans antialiased flex selection:bg-sky-100 selection:text-sky-600">
      {/*  Sidebar Component ฝั่งซ้าย */}
      <Sidebar />

      {/*  Main Dashboard Panel ฝั่งขวา */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="w-full mx-auto px-6 py-10">
          
          {/* Search Bar Section */}
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 mb-1">
              Unified Accounts Directory
            </h2>
            <p className="text-slate-400 text-xs font-medium">
              สืบค้นข้อมูลและตรวจสอบสิทธิ์เข้าใช้งานพนักงานขนานพร้อมกัน 8 ระบบหลักในเครือ AIRA
            </p>

            <form onSubmit={handleSearch} className="mt-6 flex gap-2 bg-white p-1.5 rounded-2xl border border-sky-100 shadow-[0_8px_20px_-6px_rgba(14,165,233,0.05)] focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/10 transition-all duration-300">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="ค้นหาด้วยชื่อพนักงาน หรือรหัสพนักงาน..."
                className="flex-1 bg-transparent px-3 py-2 text-slate-800 placeholder-slate-300 font-semibold text-sm focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-sky-400 hover:bg-sky-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all duration-150 min-w-[90px]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
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
                const isInactive = item.status === 'INACTIVE';

                return (
                  <div 
                    key={idx} 
                    className={`relative flex flex-col justify-between p-4 rounded-xl bg-white border transition-all duration-200 ${
                      isActive ? 'border-sky-100 shadow-[0_4px_12px_rgba(14,165,233,0.02)] hover:border-sky-300 shadow-sm' :
                      isInactive ? 'border-amber-100 hover:border-amber-200 shadow-sm' :
                      isOffline ? 'border-red-100 animate-pulse' :
                      'border-slate-100/80 bg-white opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-[11px] tracking-wider text-slate-400 uppercase">
                          {item.system}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          isActive ? 'bg-sky-50 border-sky-100 text-sky-500' :
                          isInactive ? 'bg-amber-50 border-amber-100 text-amber-500' :
                          isOffline ? 'bg-red-50 border-red-100 text-red-500' :
                          'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          {item.status === 'NOT_FOUND' ? 'Not Found' : item.status}
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
                        <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1">
                          <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-sky-400' : isInactive ? 'bg-amber-400' : 'bg-slate-300'}`} />
                          ข้อมูลผู้ใช้งาน
                        </div>
                        <p className="text-lg font-bold tracking-tight text-slate-800 truncate">
                          {isOffline || isNotFound ? '—' : (item.details?.fullName || item.username)}
                        </p>
                        {!isOffline && !isNotFound && (
                          <div className="text-[11px] text-slate-400 font-medium">
                            รหัสพนักงาน: <span className="font-mono font-bold text-slate-500">{item.username}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                        <span className="text-slate-400 font-medium">สิทธิ์การใช้งาน</span>
                        <span className={`font-bold ${isActive ? 'text-sky-500' : isInactive ? 'text-amber-500' : 'text-slate-400'}`}>
                          {item.role}
                        </span>
                      </div>
                    </div>

                    {item.details && Object.keys(item.details).length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                        {Object.entries(item.details).map(([key, val]) => {
                          if (key === 'fullName') return null;
                          return (
                            <div key={key} className="flex justify-between items-center bg-slate-50/50 p-1.5 px-2 rounded-lg border border-slate-100/40">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{key}</span>
                              <span className="font-mono font-medium text-slate-600 truncate max-w-[120px]">
                                {String(val)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;