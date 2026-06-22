import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../features/auth/auth.service"; 
import Swal from "sweetalert2";

function Sidebar() {
  const [adminName, setAdminName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 🛡️ Route Guard ดักที่ตัว Sidebar ในกรณีใช้งาน Single Page
    const verifyAdmin = async () => {
      try {
        const res = await AuthService.getUserInfo();
        setAdminName(res.data.payload.user);
      } catch (e) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    verifyAdmin();
  }, [navigate]);

  const handleLogout = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "ออกจากระบบ?",
      text: "คุณต้องการออกจากแผงควบคุมระบบ AURA ใช่หรือไม่",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    });
  };

  return (
    <aside className="w-64 bg-white border-r border-sky-100/80 flex flex-col justify-between p-4 sticky top-0 h-screen shrink-0 z-20">
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-7 h-7 rounded-lg bg-sky-400 flex items-center justify-center font-bold text-white text-sm shadow-sm">
            a
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-slate-800">AURA SYSTEM</span>
            <span className="text-[9px] font-bold text-sky-500 uppercase tracking-wider">Core Directory</span>
          </div>
        </div>

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
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600 text-xs uppercase">
            {adminName ? adminName.substring(0, 2) : "AD"}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-slate-700">{adminName || "Admin Local"}</span>
            <span className="text-[10px] text-slate-400 font-mono">IT Systems Security</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          ออกจากระบบคอร์
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;