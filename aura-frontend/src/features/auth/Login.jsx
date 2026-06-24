import React, { useState } from "react";
import Swal from "sweetalert2";
import AuthService from "./auth.service";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Credentials",
        text: "กรุณาระบุข้อมูลประจำตัวเพื่อลงชื่อเข้าใช้งานระบบ",
        confirmButtonColor: "#1e293b",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { usr: username, pwd: password };
      const res = await AuthService.login(payload);

      //  ดักดึง Token ทุกมิติ
      const finalToken = res?.token || res?.data?.token || (typeof res === 'string' ? res : null);

      if (finalToken) {
        // 1.  เซฟตั๋ว VIP ลงกระเป๋าเบราว์เซอร์
        localStorage.setItem("token", finalToken);

        // 2.  ขึ้นป๊อปอัปสำเร็จโชว์ให้เต็มตา 1.3 วินาที
        Swal.fire({
          icon: "success",
          title: "Authentication Success",
          text: "เข้าสู่ระบบควบคุมสิทธิ์ AURA สำเร็จ",
          confirmButtonColor: "#1e293b",
          timer: 1300,
          showConfirmButton: false,
        }).then(() => {
          // 3.  [สับท่อตัดจบงาน]: บังคับเปิดหน้าต่างควบคุมหลักแบบชัวร์ 100% หลังป๊อปอัปจบงาน
          window.location.replace("/home");
        });

      } else {
        console.error("Token format mismatch:", res);
        throw new Error("รูปแบบ Token ไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        confirmButtonColor: "#1e293b",
        text: error.response?.data?.message || error.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#030712] text-slate-200 antialiased" style={{ fontFamily: "'Inter', 'Sarabun', sans-serif" }}>
      
      {/*  ฝั่งซ้าย: Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#010409] border-r border-slate-800/60 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)", backgroundSize: '24px 24px' }} />
        
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-black text-black text-sm shadow-sm">
            A
          </div>
          <span className="text-sm font-bold tracking-wider text-slate-100">AURA SYSTEMS</span>
        </div>

        <div className="space-y-3.5 relative z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 uppercase tracking-widest">
             Core Terminal
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
            Centralized Accounts <br />
            <span className="text-slate-400">& Identity Control</span>
          </h2>
          <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xs">
            เทอร์มินัลกลางสำหรับตรวจสอบและสืบค้นสิทธิ์การเข้าใช้งานพนักงาน ขนานและเชื่อมต่อพร้อมกัน 8 ระบบหลักในเครือ AIRA Securities
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-500 font-bold relative z-10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          node_01 // SECURE CONNECTION
        </div>
      </div>

      {/*  ฝั่งขวา: Console Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-[#030712]">
        <div className="mx-auto w-full max-w-[400px]">
          
          <div className="mb-9">
            <h1 className="text-4xl font-black tracking-tight text-white mb-2.5">
              Sign In to Console
            </h1>
            <p className="text-slate-300 text-sm font-semibold tracking-wide">
              ป้อนบัญชีสิทธิ์ระดับ IT Administrator เพื่อเข้าใช้งานระบบ
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-2.5">
                Operator Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ชื่อผู้ใช้งานแอดมิน..."
                className="w-full bg-[#090d16] border border-slate-800/90 rounded-xl px-4 py-3.5 text-base text-white font-bold placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-all duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-2.5">
                Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#090d16] border border-slate-800/90 rounded-xl px-4 py-3.5 text-base text-white font-mono placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-100 hover:bg-white disabled:bg-slate-950 disabled:text-slate-700 text-black font-black text-sm uppercase tracking-widest py-3.5 px-5 rounded-xl shadow-md active:scale-[0.99] transition-all duration-150 mt-2 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Authenticate"
              )}
            </button>
          </form>

          <div className="mt-9 pt-6 border-t border-slate-900/60 flex justify-between items-center text-xs text-slate-400 font-bold tracking-wide">
            <span>AURA SECURITY DIRECTORY</span>
            <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80">TLS 1.3</span>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;