import { useState } from 'react';
import { searchUserAcrossSystems } from './services/search.service';
import Sidebar from './components/Sidebar';

// 📋 รายชื่อระบบทั้งหมดในเครือสำหรับการทำ Filter
const ALL_SYSTEMS = [
  'AIRA', 'ATSRequest', 'ForeCast', 'GlobalTrade', 
  'IPO Plus', 'MTC', 'PreConfirm', 'TfexMIS'
];

function App() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState(ALL_SYSTEMS);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await searchUserAcrossSystems(keyword);
      setResults(response.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSystem = (systemName) => {
    if (selectedSystems.includes(systemName)) {
      if (selectedSystems.length > 1) {
        setSelectedSystems(selectedSystems.filter(sys => sys !== systemName));
      }
    } else {
      setSelectedSystems([...selectedSystems, systemName]);
    }
  };

  // 🎯 อธิบายสิทธิ์การใช้งาน (โซนควบคุมความปลอดภัย)
  const getRoleExplanation = (role) => {
    const cleanRole = String(role).trim();
    switch(cleanRole) {
      case 'Head/Admin':
      case 'Admin':
      case 'Head':
        return 'ระดับสูงสุด (Executive): อนุมัติธุรกรรม ตั้งค่าระบบ และจัดการสิทธิ์พนักงานคนอื่นได้ทั้งหมด';
      case 'Operator':
        return 'ระดับเจ้าหน้าที่ปฏิบัติการ (Operational): คีย์ระเบียนข้อมูล ยิงคำสั่ง หรือดึงรายงานรายวันตามหน้าที่';
      case 'Low/Operator':
        return 'ระดับผู้บันทึกเริ่มต้น (Restricted): จัดการได้เฉพาะข้อมูลส่วนย่อยในกลุ่มโครงการที่ผูกไว้เท่านั้น';
      case 'General User':
      case 'User':
      case 'Marketing / General User':
        return 'ระดับพนักงานทั่วไป (General Staff): เรียกดูข้อมูลพื้นฐาน คีย์สัญญากับฝ่ายมาร์เก็ตติ้งหรือธุรการ';
      default:
        return 'สิทธิ์ใช้งานทั่วไปตามนโยบายความปลอดภัยองค์กร';
    }
  };

  // 📊 แปลรหัสโครงสร้างสังกัดองค์กร (โซนโครงสร้าง HR)
  const getExtendedInfoText = (key, value) => {
    const cleanKey = key.trim();
    const cleanVal = String(value).toUpperCase().trim();

    if (cleanKey === 'projectGroup') {
      const desc = cleanVal === 'BO' ? 'Back Office (สายงานสนับสนุนปฏิบัติการส่วนหลัง)' : cleanVal;
      return { label: ' กลุ่มโครงการ (Project Group)', valText: desc };
    }
    if (cleanKey === 'group') {
      let desc = cleanVal;
      if (cleanVal === 'BO') desc = 'Back Office (กลุ่มงานสารสนเทศและตรวจสอบระบบคอมพิวเตอร์)';
      if (cleanVal === 'MKT') desc = 'Marketing (กลุ่มงานกลยุทธ์และการตลาดตราสารทุน)';
      if (cleanVal === 'IT') desc = 'Information Technology (ฝ่ายเทคโนโลยีสารสนเทศองค์กร)';
      return { label: ' กลุ่มทีมทำงาน (Operational Group)', valText: desc };
    }
    if (cleanKey === 'department') {
      let desc = cleanVal;
      if (cleanVal === 'OPER') desc = 'Operations (ฝ่ายปฏิบัติการวิเคราะห์สถิติตลาดทุน)';
      if (cleanVal === 'N/A') desc = 'ไม่มีการผูกแผนก (Account เฉพาะระบบ)';
      return { label: ' แผนกที่สังกัด (Department)', valText: desc };
    }
    return { label: cleanKey, valText: String(value) };
  };

  const filteredResults = results.filter(item => selectedSystems.includes(item.system));

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200 font-sans antialiased flex selection:bg-sky-500/30 selection:text-sky-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="w-full mx-auto px-8 py-12">
          
          {/* Header Title Section */}
          <div className="max-w-2xl mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Unified Accounts Directory
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              ระบบตรวจสอบ Identity & Access Management ค้นหาและจำแนกสิทธิ์การใช้งานพนักงานขนานพร้อมกัน 8 ระบบในเครือ AIRA
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-3 bg-[#131b2e] p-2 rounded-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/5 transition-all duration-300">
              <div className="flex-1 flex items-center gap-3 px-3">
                <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="ป้อนชื่อพนักงาน หรือ รหัสพนักงานที่ต้องการตรวจสอบ..."
                  className="w-full bg-transparent py-2.5 text-white placeholder-slate-600 font-bold text-base focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all duration-150 min-w-[110px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  'เริ่มสืบค้น'
                )}
              </button>
            </form>
          </div>

          {/* 🎛️ แผงควบคุมตัวกรอง (System Filter Checking) */}
          <div className="bg-[#131b2e]/40 border border-slate-800/80 rounded-2xl p-5 mb-10 max-w-5xl backdrop-blur-md shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <span className="flex w-2 h-2 rounded-full bg-sky-500 shadow-md shadow-sky-500/50 animate-pulse" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ระบบข้อมูลสืบค้นร่วม (System Filter Monitoring)</span>
              </div>
              <div className="flex gap-2 text-[11px] font-black">
                <button 
                  type="button"
                  onClick={() => setSelectedSystems(ALL_SYSTEMS)} 
                  className="px-3 py-1.5 bg-[#131b2e] border border-slate-800 hover:border-slate-700 text-sky-400 rounded-lg transition-all duration-150 active:scale-95"
                >
                  ✓ แสดงทุกระบบ
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedSystems([ALL_SYSTEMS[0]])} 
                  className="px-3 py-1.5 bg-[#131b2e] border border-slate-800 hover:border-slate-700 text-slate-500 rounded-lg transition-all duration-150 active:scale-95"
                >
                  ⎋ ล้างข้อมูลจอ
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALL_SYSTEMS.map((sys) => {
                const isChecked = selectedSystems.includes(sys);
                return (
                  <label 
                    key={sys}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-black cursor-pointer transition-all duration-300 select-none ${
                      isChecked 
                        ? 'bg-gradient-to-r from-sky-500/10 to-sky-500/[0.02] border-sky-500/40 text-white shadow-md' 
                        : 'bg-[#090d16]/40 border-slate-800/60 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSystem(sys)}
                      className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500/20 w-4 h-4"
                    />
                    {sys}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Results Grid - แยก Layer ข้อมูลแก้ความมึนหัว งงงวย */}
          {searched && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredResults.map((item, idx) => {
                const isActive = item.status === 'ACTIVE';
                const isOffline = item.status === 'OFFLINE';
                const isNotFound = item.status === 'NOT_FOUND';
                const isInactive = item.status === 'INACTIVE';

                return (
                  <div 
                    key={`${item.system}-${item.username}-${idx}`} 
                    className={`relative flex flex-col justify-between p-5 rounded-2xl bg-[#131b2e] border shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                      isActive ? 'border-emerald-500/15 shadow-[0_12px_40px_rgba(16,185,129,0.02)] hover:border-emerald-500/40' :
                      isInactive ? 'border-amber-500/20 shadow-[0_12px_40px_rgba(245,158,11,0.02)] hover:border-amber-500/40' :
                      isOffline ? 'border-rose-500/30 animate-pulse bg-rose-950/5' :
                      'border-slate-800/60 bg-[#131b2e]/40 opacity-40'
                    }`}
                  >
                    <div>
                      {/* ========================================================
                          โซนที่ 1: Identity & System (ระบุตัวตนและชื่อระบบปฏิบัติการ)
                          ======================================================== */}
                      <div className="flex justify-between items-center mb-4 border-b border-slate-800/30 pb-3">
                        <span className="font-black text-xs tracking-widest text-slate-400 uppercase">
                          {item.system}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-black border uppercase tracking-wider ${
                          isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          isInactive ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                          isOffline ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                          'bg-slate-800 border-slate-700 text-slate-500'
                        }`}>
                          {item.status === 'NOT_FOUND' ? 'Not Found' : item.status}
                        </span>
                      </div>

                      <div className="space-y-1 mb-5">
                        <h3 className="text-xl font-black tracking-tight text-white line-clamp-1" title={item.details?.fullName || item.username}>
                          {isOffline || isNotFound ? '—' : (item.details?.fullName || item.username)}
                        </h3>
                        {!isOffline && !isNotFound && (
                          <div className="text-xs text-slate-400 font-bold">
                            รหัสพนักงาน: <span className="font-mono text-sky-400 font-black bg-sky-500/5 px-1.5 py-0.5 rounded border border-sky-500/10 ml-0.5">{item.username}</span>
                          </div>
                        )}
                      </div>

                      {/* ========================================================
                          โซนที่ 2: Access & Permission (เรื่องสิทธิ์และความรับผิดชอบ)
                          ======================================================== */}
                      <div className="bg-[#090d16]/70 border border-slate-800/80 rounded-xl p-3 mb-4 shadow-inner">
                        <div className="flex justify-between items-center border-b border-slate-800/50 pb-2 mb-2 text-xs font-bold">
                          <span className="text-slate-500 uppercase tracking-wide"> สิทธิ์เข้าใช้งาน (Role)</span>
                          <span className={`font-black uppercase tracking-wide text-[11px] ${isActive ? 'text-emerald-400' : isInactive ? 'text-amber-400' : 'text-slate-500'}`}>
                            {item.role}
                          </span>
                        </div>
                        
                        {!isOffline && !isNotFound && (
                          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                            {getRoleExplanation(item.role)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ========================================================
                        โซนที่ 3: HR Organizational Structure (สายงาน/แผนก/สังกัดกลุ่ม)
                        ======================================================== */}
                    {item.details && Object.keys(item.details).length > 0 && (
                      <div className="mt-2 pt-3 border-t border-slate-800 text-xs space-y-2">
                        <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">
                           โครงสร้างการสังกัดองค์กร:
                        </div>
                        {Object.entries(item.details).map(([key, val]) => {
                          if (key === 'fullName') return null;
                          const mappedInfo = getExtendedInfoText(key, val);
                          return (
                            <div key={key} className="flex justify-between items-start bg-[#090d16]/30 p-2.5 rounded-xl border border-slate-800/40 gap-4">
                              <span className="text-[10px] text-slate-500 font-black shrink-0 uppercase tracking-wide">
                                {mappedInfo.label.split(' ')[0]} {key === 'department' ? 'แผนก' : key === 'group' ? 'กลุ่มงาน' : 'โปรเจกต์'}
                              </span>
                              <span className="font-bold text-slate-300 text-xs leading-tight text-right">
                                {mappedInfo.valText}
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