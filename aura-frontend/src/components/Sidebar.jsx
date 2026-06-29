import { useEffect, useState } from "react";
import AuthService from "../features/auth/auth.service"; 
import Swal from "sweetalert2";
import { Link, useLocation } from "react-router-dom"; 

function Sidebar() {
  const [adminName, setAdminName] = useState("");
  const [adminLevel, setAdminLevel] = useState("");
  const location = useLocation(); 

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await AuthService.getUserInfo();
        const payloadData = res?.data?.payload;
        
        const fullName = payloadData?.name || "Admin Local";
        const roleLevel = payloadData?.level ? String(payloadData.level).toUpperCase() : "OPERATOR";

        setAdminName(fullName);
        setAdminLevel(roleLevel);
      } catch (e) {
        console.error("Guard ดักเจอข้อผิดพลาดเลยเตะออก:", e);
        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    };
    verifyAdmin();
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "ออกจากระบบ?",
      text: "คุณต้องการออกจากแผงควบคุมระบบ AURA ใช่หรือไม่",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#38bdf8",
      cancelButtonColor: "#1e293b",
      background: "#1e293b",
      color: "#fff",
      confirmButtonText: "ใช่, ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    });
  };

  return (
    // 🌌 ชุบชีวิตเมนูซ้ายเป็นธีมสี Slate-900 แมปกับบอร์ดหลังบ้านนุ่มนวลสายตาครับโฟม
    <aside className="w-64 bg-[#1e293b]/60 border-r border-slate-800 flex flex-col justify-between p-5 sticky top-0 h-screen shrink-0 z-20 font-sans select-none">
      
      <div className="space-y-8">
        {/* Logo Header */}
        <div className="flex items-center gap-3 px-1 py-1 border-b border-slate-800/60 pb-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-sky-500/20">
            a
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-white leading-tight">AURA SYSTEM</span>
            <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest mt-0.5">Core Directory</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-2">
          <div className="text-[10px] font-bold text-slate-500 px-3 uppercase tracking-widest mb-3">
            Menu Operations
          </div>
          
          {/* ปุ่มเมนูหน้าเสิร์ชพนักงานหลัก */}
          <Link 
            to="/home" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-extrabold text-xs tracking-wide transition-all duration-200 ${
              location.pathname === "/home"
                ? "bg-sky-500/10 border-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/[0.02]"
                : "bg-transparent border-transparent text-slate-400 hover:bg-[#151f32] hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Directory Search
          </Link>

          {/* ปุ่มเมนูแดชบอร์ดลอร์กประวัติ */}
          <Link 
            to="/audit-logs" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-extrabold text-xs tracking-wide transition-all duration-200 ${
              location.pathname === "/audit-logs" || location.pathname === "/Dashboard"
                ? "bg-sky-500/10 border-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/[0.02]"
                : "bg-transparent border-transparent text-slate-400 hover:bg-[#151f32] hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path>
            </svg>
            Audit Logs
          </Link>
        </nav>
      </div>

      {/* ส่วนล่าง Account Profile */}
      <div className="border-t border-slate-800 pt-5">
        <div className="bg-[#151f32]/40 rounded-2xl p-3 border border-slate-800/60 flex items-center justify-between gap-2 shadow-inner">
          
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-black text-sky-400 text-xs shadow-sm uppercase shrink-0">
              {adminName ? adminName.substring(0, 2) : "AD"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-slate-200 truncate leading-tight">
                {adminName}
              </span>
              <span className="text-[9px] text-slate-500 font-bold tracking-wider font-mono mt-0.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                {adminLevel} 
              </span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            title="ออกจากระบบ"
            className="w-8 h-8 rounded-xl bg-[#1e293b] hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all duration-200 shrink-0 shadow-sm group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

        </div>
      </div>

    </aside>
  );
}

export default Sidebar;