import { useState } from 'react';
import { searchUserAcrossSystems } from './services/search.service';
import Sidebar from './components/Sidebar';

import UserDetailModal from './components/UserDetailModal';

// 📋 บัญชีรายชื่อระบบพนักงานทั้งหมดในเครือกลุ่มบริษัทหลักทรัพย์ AIRA สำหรับทำ Filter
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

  // States สำหรับควบคุมการเปิด/ปิด หน้าต่างโมดัลแสดงข้อมูลดิบ (Raw ข้อมูล Log หลังบ้าน)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleOpenUserModal = (userItem) => {
    setSelectedUser(userItem);
    setIsModalOpen(true);
  };

  // 📖 ดิกชันนารีป้ายกำกับบอกความหมายคำย่อประจำองค์กร (Glossary Tags Ledger)
  const glossaryTags = [
    { acronym: 'BO', title: 'Back Office', desc: 'สายงานปฏิบัติการส่วนหลัง ตรวจสอบระเบียนคำสั่ง ธุรกรรมซื้อขาย และสิทธิ์ควบคุมโครงสร้างภายใน' },
    { acronym: 'MKT', title: 'Marketing', desc: 'กลุ่มงานเจ้าหน้าที่การตลาด (AE) ดูแลและจัดสรรโควตาสัญญากรรมสิทธิ์พอร์ตจองซื้อหลักทรัพย์ของลูกค้าในความรับผิดชอบ' },
    { acronym: 'OPER', title: 'Operations', desc: 'ฝ่ายปฏิบัติการวิเคราะห์สถิติตลาดทุน ตรวจสอบรายการโอนย้ายเงิน และควบคุมแผงระบบซื้อขายหลักทรัพย์ประจำวัน' },
    { acronym: 'IT', title: 'Information Technology', desc: 'ฝ่ายโครงสร้างพื้นฐานเทคโนโลยีสารสนเทศ ดูแลความปลอดภัยเน็ตเวิร์กองค์กร และบริหารจัดการบัญชีผู้ใช้งานผู้ถือสิทธิ์' }
  ];

  // 🎯 กลไกถอดรหัสและแจงคำอธิบายสิทธิ์ (Role Scope) เจาะลึกความรับผิดชอบ "แยกตามระบบ" อย่างถูกต้อง ไม่มั่ว
  const getSystemRoleExplanation = (system, role) => {
    const cleanRole = String(role).trim().toUpperCase();
    
    // 1. จำแนกสิทธิ์เฉพาะของตู้ระบบตลาดอนุพันธ์ TfexMIS
    if (system === 'TfexMIS') {
      if (cleanRole === 'ADMIN' || cleanRole === 'H') {
        return 'ผู้ดูแลสิทธิ์สูงสุด (High Privileges): เข้าถึงข้อมูล Users ประเมินความ riesgo พอร์ต (Stress Test) และดูรายงานบริหารภาพรวมบริษัทได้ทั้งหมด';
      }
      return 'ผู้ปฏิบัติการทั่วไป (Operator/Low): เข้าถึงรายงานปริมาณการซื้อขาย (Volume) และสถิติกำไร/ขาดทุนเฉพาะกลุ่มตามที่ User Group สังกัด';
    }

    // 2. จำแนกสิทธิ์เฉพาะของตู้ระบบยืนยันสัญญาล่วงหน้า PreConfirm
    if (system === 'PreConfirm') {
      if (cleanRole === 'ADMIN' || cleanRole === 'IT') {
        return 'ผู้ดูแลสิทธิ์ด้านเทคนิค (IT Admin): ทำหน้าที่ควบคุมโครงสร้าง ดูแลการสร้าง Account ผู้ใช้ รีเซ็ตรหัสผ่านเริ่มต้น (111111) และปลดล็อกระบบ';
      }
      return 'เจ้าหน้าที่การตลาด (Marketing/AE): เข้าถึงเมนู List Customer เพื่อกดยืนยันรายชื่อลูกค้าส่งอีเมลแจ้งเตือนล่วงหน้า (Pre-Confirm Email)';
    }

    // 3. จำแนกสิทธิ์เฉพาะของตู้ระบบคัดกรองความเสี่ยงฟอกเงิน MTC
    if (system === 'MTC') {
      if (cleanRole === 'ADMIN') {
        return 'ผู้คุมระบบ Compliance (MTC Admin): ถือสิทธิ์บริหารหน้าจอผู้ใช้งาน Reset Password และควบคุมผังเชื่อมต่อข้อมูลบัญชีเฝ้าระวัง';
      }
      return 'เจ้าหน้าที่คัดกรองความเสี่ยง (General User): ปฏิบัติงานคัดกรองรายชื่อลูกค้ากับฐานข้อมูล AMLO, LED ล้มละลาย, รายชื่อบุคคลทางการเมือง PEPs และ Batch Scan';
    }

    // 4. จำแนกสิทธิ์เฉพาะของตู้งานเสนอขายหลักทรัพย์ไอพีโอ IPO Plus
    if (system === 'IPO Plus') {
      if (cleanRole === 'HEAD' || cleanRole === 'ADMIN' || cleanRole === 'H') {
        return 'หัวหน้างาน Back Office (High Level): จัดการตั้งค่าโครงการหุ้น IPO/RO/Tender อนุมัติการตัดบัญชีระบบ ATS และจัดสรรโควตาทีมการตลาด';
      }
      return 'ผู้ปฏิบัติงานบันทึกจองซื้อ (Low/Operator): สแกนและคีย์ข้อมูลการจองซื้อหลักทรัพย์ของลูกค้า ตรวจสอบสลิปชำระเงินตามโมดูลโปรเจกต์ที่ได้รับอนุญาต';
    }

    // 5. จำแนกสิทธิ์ระบบสนับสนุนธุรกรรมต่างประเทศ GlobalTrade
    if (system === 'GlobalTrade') {
      if (cleanRole === 'ADMIN' || cleanRole === 'H') {
        return 'ผู้ดูแลระบบธุรกรรมสากล (High Admin): ควบคุมกระบวนการประมวลผลสิ้นวัน (EOD Processing) กำหนดอัตราแลกเปลี่ยน และออกใบกำกับภาษีส่ง BOT/SEC';
      }
      return 'เจ้าหน้าที่ปฏิบัติการพอร์ตต่างประเทศ (Operator/Low): ตรวจสอบความถูกต้องของยอดถือครองหลักทรัพย์สากล (Reconcile Position) และบันทึกรายการฝากถอนเงินสดหลายสกุลเงิน';
    }

    // 6. จำแนกสิทธิ์ระบบคาดการณ์กระแสเงินสด ForeCast
    if (system === 'ForeCast') {
      return 'สิทธิ์ปฏิบัติการร่วม (Standard Account): บันทึกระเบียบคาดการณ์รายการเงินฝาก/ถอนล่วงหน้า ติดตามกระแสเงินสด Cash Flow ตรวจสอบลายเซ็น และออกรายงาน Excel/PDF';
    }

    // 7. สิทธิ์กลางสำหรับระบบแกนหลักและระบบคำขอทั่วไป (AIRA / ATSRequest)
    if (cleanRole === 'ADMIN' || cleanRole === 'HEAD' || cleanRole === 'HEAD/ADMIN' || cleanRole === 'H') {
      return 'สิทธิ์ระดับผู้บริหาร/ผู้ดูแลกลาง: สิทธิ์อนุมัติระเบียนคำขอ ใช้เครื่องมือจัดการ Content ประกาศข่าวสาร และบริหารระเบียบผู้เข้าใช้งานระบบไอทีหลัก';
    }
    return 'สิทธิ์ระดับผู้ปฏิบัติการทั่วไป: เข้าถึงสารบบข้อมูล ค้นหาข้อมูลติดต่อพนักงาน และดึงรายงานประจำวันตามขอบเขตงานควบคุมความปลอดภัย';
  };

  // 🔐 ตัวแปลป้ายสิทธิการใช้งาน (Role Badge Config)
  const getRoleText = (role) => {
    const cleanRole = String(role).trim().toUpperCase();
    if (cleanRole.includes('ADMIN') || cleanRole === 'H' || cleanRole === 'HEAD') {
      return { label: role, style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    }
    if (cleanRole.includes('OPERATOR') || cleanRole === 'OPER') {
      return { label: role, style: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
    }
    if (cleanRole.includes('LOW') || cleanRole.includes('RESTRICTED')) {
      return { label: role, style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { label: role, style: 'bg-slate-800 text-slate-400 border-slate-700' };
  };

 // 🏢 ถอดรหัสโครงสร้างสังกัด HR แยกตามเงื่อนไขแพทเทิร์นดาต้าเบสของแต่ละระบบจริง (Dynamic Parsing)
  const parseExtendedUnit = (item) => {
    if (!item.details || Object.keys(item.details).length === 0) return '—';
    
    const systemName = item.system;

    // 1. ตรวจสอบการแปลค่ากรณีมีคีย์ระบุชัดเจนตามสเปกสารบบฐานข้อมูลหลัก
    if (systemName === 'TfexMIS' && item.details.group) {
      const g = String(item.details.group).toUpperCase().trim();
      const text = g === 'BO' ? 'Back Office (ฝ่ายสารสนเทศปฏิบัติการส่วนหลัง)' : g === 'IT' ? 'IT (ฝ่ายเทคโนโลยีระบบ)' : g === 'MKT' ? 'Marketing (ฝ่ายการตลาด)' : g;
      return `กลุ่มงานระบบอนุพันธ์: ${text}`;
    }
    
    if (systemName === 'PreConfirm' && item.details.group) {
      const g = String(item.details.group).toUpperCase().trim();
      const text = g === 'MKT' ? 'Marketing / AE (เจ้าหน้าที่การตลาดดูแลรายชื่อลูกค้า)' : g === 'IT' ? 'IT Admin (ผู้ดูแลระบบ)' : g;
      return `กลุ่มงานส่งอีเมล: ${text}`;
    }
    
    if (systemName === 'ForeCast' && item.details.department) {
      const d = String(item.details.department).toUpperCase().trim();
      const text = d === 'OPER' ? 'Operations (ฝ่ายปฏิบัติการวิเคราะห์ธุรกรรมเงินสด)' : d;
      return `ฝ่ายสังกัด: ${text}`;
    }
    
    if (systemName === 'IPO Plus' && item.details.projectGroup) {
      const p = String(item.details.projectGroup).toUpperCase().trim();
      const text = p === 'BO' ? 'Back Office (สายงานสนับสนุนจัดสรรหุ้น IPO)' : p;
      return `โครงการจัดสรร: ${text}`;
    }
    
    if (systemName === 'GlobalTrade') {
      const d = item.details.department ? String(item.details.department).toUpperCase().trim() : '';
      if (d === 'N/A' || !d) return 'ไม่ได้ผูกระเบียนแผนกในระบบนี้ (บัญชีประเภท Standalone)';
      return `แผนกพอร์ตต่างประเทศ: ${d}`;
    }

    // 2. Dynamic Fallback: กรณีไม่เข้าเงื่อนไขระบบด้านบน ให้คลี่ Entry คีย์ทั้งหมดออกเพื่อแสดงผลแบบยืดหยุ่น (ไม่พ่น JSON ปีกกาดิบ)
    // โดยคัดกรองไม่เอาฟิลด์ fullName มาพ่นซ้ำในช่องสังกัดองค์กร
    const entries = Object.entries(item.details).filter(([key]) => key !== 'fullName');
    
    if (entries.length > 0) {
      return entries
        .map(([key, val]) => {
          // แปลงชื่อคีย์ให้อ่านง่ายเป็นสากลขึ้น
          let formattedKey = key;
          if (key === 'projectGroup') formattedKey = 'โครงการ';
          if (key === 'group') formattedKey = 'กลุ่มงาน';
          if (key === 'department') formattedKey = 'แผนก';
          return `${formattedKey}: ${String(val).toUpperCase()}`;
        })
        .join(' | ');
    }
    
    return '—';
  };

  const filteredResults = results.filter(item => selectedSystems.includes(item.system));

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200 font-sans antialiased flex selection:bg-sky-500/30 selection:text-sky-300 w-full">
      
      <Sidebar />

      {/* บอร์ดแผงควบคุมหลัก ปรับโครงสร้าง w-full ยืดขยายเต็มพื้นที่จอเบราว์เซอร์ลบปัญหากรอยเว้นว่าง */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
        <main className="w-full mx-auto px-8 py-12">
          
          {/* Header Dashboard Title */}
          <div className="w-full mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Unified Accounts Directory
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              แผงควบคุมตรวจสอบความปลอดภัย (IAM Dashboard) ทำการสืบค้นสถานะระเบียนสิทธิ์การเข้าถึงพนักงานขนานพร้อมกัน 8 ฐานข้อมูลหลักในเครือกลุ่มบริษัทหลักทรัพย์ AIRA
            </p>

            <form onSubmit={handleSearch} className="mt-6 flex gap-3 bg-[#131b2e] p-2 rounded-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/5 transition-all duration-300 w-full max-w-3xl">
              <div className="flex-1 flex items-center gap-3 px-3">
                <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="เสิร์ชด้วยชื่อ-นามสกุลจริง หรือ ป้อนรหัสพนักงานคีย์ตรวจสอบ (เช่น 3669, admin)..."
                  className="w-full bg-transparent py-2.5 text-white placeholder-slate-600 font-bold text-base focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all duration-150 min-w-[110px]"
              >
                {loading ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto"></div> : 'เริ่มสืบค้น'}
              </button>
            </form>
          </div>

          {/* 📖 ป้ายบอกความหมายตัวย่อส่วนงานกลางองค์กร (Glossary Tags Ledger) - ยืดเต็มหน้าจอ */}
          <div className="mb-8 w-full">
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>📖</span> บัญชีสัญลักษณ์ป้ายกำกับตัวย่อส่วนงานองค์กร (AIRA Enterprise Acronym Glossary)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {glossaryTags.map(tag => (
                <div key={tag.acronym} className="bg-[#131b2e]/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm shadow-lg transition-all duration-200 hover:border-slate-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs px-2 py-0.5 rounded-md font-mono font-black">{tag.acronym}</span>
                    <span className="text-xs font-black text-slate-200 uppercase tracking-wide">{tag.title}</span>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed">{tag.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 🎛️ แผงควบคุมสวิตช์ฟิลเตอร์เลือกระบบ - ยืดเต็มหน้าจอ */}
          <div className="bg-[#131b2e]/40 border border-slate-800/80 rounded-2xl p-4 mb-8 w-full backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="flex w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50 animate-pulse" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">แผงมอนิเตอร์เลือกแสดงผลระบบฐานข้อมูล (System Toggle Filter)</span>
              </div>
              <div className="flex gap-3 text-[11px] font-black">
                <button type="button" onClick={() => setSelectedSystems(ALL_SYSTEMS)} className="text-sky-400 hover:text-sky-300 transition-colors">✓ แสดงทุกระบบ</button>
                <button type="button" onClick={() => setSelectedSystems([ALL_SYSTEMS[0]])} className="text-slate-500 hover:text-slate-400 transition-colors">⎋ เคลียร์ช่องแสดงผล</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_SYSTEMS.map((sys) => {
                const isChecked = selectedSystems.includes(sys);
                return (
                  <label key={sys} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer transition-all duration-200 select-none ${isChecked ? 'bg-sky-500/10 border-sky-500/30 text-white shadow-sm' : 'bg-transparent border-slate-800/60 text-slate-500 hover:border-slate-700'}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleToggleSystem(sys)} className="rounded border-slate-700 bg-slate-900 text-sky-500 w-3.5 h-3.5 focus:ring-0 focus:ring-offset-0" />
                    {sys}
                  </label>
                );
              })}
            </div>
          </div>

          {/* 📊 แผงตารางรายงานขนานสไตล์พรีเมียม (Single Matrix Table View) */}
          {searched && (
            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden w-full transition-all duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#090d16] border-b border-slate-800 text-slate-400 font-black text-xs uppercase tracking-wider">
                      <th className="py-4.5 px-6">ระบบปฏิบัติการ (System)</th>
                      <th className="py-4.5 px-6">สถานะไอที (Status)</th>
                      <th className="py-4.5 px-6">ชื่อผู้ใช้งาน (User Profile Name)</th>
                      <th className="py-4.5 px-6">รหัสพนักงาน (Username ID)</th>
                      <th className="py-4.5 px-6">ขอบเขตสิทธิ์และความรับผิดชอบ (Role Scope & Privileges)</th>
                      <th className="py-4.5 px-6">โครงสร้างหน่วยงานสังกัด (HR Org Matrix)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 font-medium text-[13px]">
                    {filteredResults.map((item, idx) => {
                      const isActive = item.status === 'ACTIVE';
                      const isOffline = item.status === 'OFFLINE';
                      const isNotFound = item.status === 'NOT_FOUND';
                      const roleConfig = getRoleText(item.role);

                      return (
                        <tr 
                          key={`${item.system}-${item.username}-${idx}`} 
                          className={`transition-colors duration-150 hover:bg-slate-800/40 ${isNotFound ? 'opacity-30' : ''} ${isOffline ? 'bg-rose-950/10 text-rose-300' : ''}`}
                        >
                          {/* คอลัมน์ที่ 1: ชื่อระบบ */}
                          <td className="py-4 px-6 font-black text-white text-sm tracking-wide">{item.system}</td>
                          
                          {/* คอลัมน์ที่ 2: ป้ายสถานะ */}
                          <td className="py-4 px-6">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-black border uppercase tracking-wide ${
                              isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              isOffline ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' :
                              'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                              {item.status === 'NOT_FOUND' ? 'Not Found' : item.status}
                            </span>
                          </td>
                          
                          {/* คอลัมน์ที่ 3: ชื่อจริงพนักงาน (ผูก Trigger สำหรับกดยิงเปิดหน้าต่างดู Log ข้อมูลดิบด้านนอก) */}
                          <td className="py-4 px-6">
                            {isOffline || isNotFound ? (
                              <span className="text-slate-600 font-bold">—</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenUserModal(item)}
                                className="text-slate-200 hover:text-sky-400 font-black text-left transition-colors hover:underline focus:outline-none text-[14px]"
                              >
                                {item.details?.fullName || item.username}
                              </button>
                            )}
                          </td>

                          {/* คอลัมน์ที่ 4: รหัสพนักงาน Username */}
                          <td className="py-4 px-6 font-mono text-sky-400 font-bold text-sm">
                            {isOffline || isNotFound ? <span className="text-slate-600">—</span> : item.username}
                          </td>

                          {/* คอลัมน์ที่ 5: ระดับสิทธิ์ + อธิบายขอบเขตหน้าที่แยกความรับผิดชอบขาดตามระบบออโต้ */}
                          <td className="py-4 px-6 max-w-sm">
                            <div className="flex flex-col gap-2 py-0.5">
                              <span className={`w-fit text-[10px] px-2 py-0.5 rounded font-black border uppercase tracking-wider ${roleConfig.style}`}>
                                {item.role}
                              </span>
                              {!isOffline && !isNotFound && (
                                <span className="text-[12px] text-slate-400 font-medium leading-relaxed block">
                                  {getSystemRoleExplanation(item.system, item.role)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* คอลัมน์ที่ 6: สายงาน/แผนกสังกัดของระบบนั้น ๆ แปลคำย่อเสร็จสรรพ */}
                          <td className="py-4 px-6 font-bold text-slate-300 leading-relaxed text-xs">
                            {isOffline || isNotFound ? <span className="text-slate-600">—</span> : parseExtendedUnit(item)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 📦 เรียกใช้งานชิ้นส่วนคอมโพเนนต์ UserDetailModal สแตนด์อโลนที่ดึงมาจากภายนอก */}
      <UserDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={selectedUser}
      />
    </div>
  );
}

export default App;