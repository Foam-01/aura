import { useState } from "react";
import { searchUserAcrossSystems } from "./services/search.service";
import Sidebar from "./components/Sidebar";

function App() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // 🎯 🟢 เช็ค Format รหัสพนักงาน: ยอมรับเฉพาะตัวเลขล้วน หรืออังกฤษตัวเดียวนำหน้าตามด้วยเลขเท่านั้น
  const cleanKey = keyword.trim().toLowerCase();
  const isFormatValid = /^[a-zA-Z]?\d+$/.test(cleanKey) || cleanKey === "admin";

  const handleSearch = async (e) => {
    e.preventDefault();
    // ดักจับอีกชั้นนึง ถ้ารหัสไม่ถูกต้องตาม Format ไม่ให้ส่งฟอร์มไปหาหลังบ้าน
    if (!keyword.trim() || !isFormatValid) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await searchUserAcrossSystems(keyword);
      setResults(response.data || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 1. ฟังก์ชันจัดการสีของป้ายสิทธิ์
  const getRoleBadgeStyle = (role) => {
    const cleanRole = String(role).trim().toUpperCase();
    if (
      cleanRole.includes("ADMIN") ||
      cleanRole === "H" ||
      cleanRole === "HEAD"
    ) {
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
    if (
      cleanRole.includes("OPERATOR") ||
      cleanRole === "OPER" ||
      cleanRole === "OPERATIONS"
    ) {
      return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  // 🔐 2. ฟังก์ชันบีบข้อความสิทธิ์คอลัมน์ Authorize ให้เหลือแค่ H หรือ L
  const getShortAuthorize = (role) => {
    const cleanRole = String(role).trim().toUpperCase();
    if (
      cleanRole.includes("ADMIN") ||
      cleanRole === "H" ||
      cleanRole === "HEAD"
    ) {
      return "H";
    }
    return "L";
  };

  // 🏢 3. ฟังก์ชันดึงค่า Group / Department (เวอร์ชันป้องกันเลข ID หลุดโชว์)
  const getDisplayGroup = (item) => {
    if (!item.details) return "—";
    const groupVal =
      item.details.group ||
      item.details.user_group ||
      item.details.department ||
      item.details.depart_id ||
      item.details.projectGroup;
    if (!groupVal || groupVal === "N/A") return "—";
    const cleanGroup = String(groupVal).trim();
    if (/^\d+$/.test(cleanGroup)) return "—";
    return cleanGroup.toUpperCase();
  };

  // 💼 4. ฟังก์ชันดึงค่า Role ยึดตามข้อมูลจริงจาก Backend 
  const getDisplayRole = (item) => {
    if (!item.role) return "—";
    let cleanRole = String(item.role).trim();
    if (cleanRole.includes("/")) {
      cleanRole = cleanRole.split("/")[0].trim();
    }
    const upperRole = cleanRole.toUpperCase();
    if (!upperRole || upperRole === "N/A" || upperRole === "—") return "—";

    if (upperRole === "ADMIN") return "Admin";
    if (upperRole === "HEAD") return "Head Manager";
    if (upperRole === "HEAD/ADMIN" || upperRole === "IT") return "IT Admin";
    if (upperRole === "OPERATOR" || upperRole === "OPER") return "Operator";
    if (upperRole === "OPERATIONS") return "Operations";
    if (upperRole === "MARKETING" || upperRole === "MKT") return "Marketing";
    if (upperRole === "USER" || upperRole === "GENERAL USER") return "User";
    if (upperRole === "H") return "High Privileges";
    if (upperRole === "L" || upperRole === "LOW") return "Low Operator";

    return cleanRole.charAt(0).toUpperCase() + cleanRole.slice(1);
  };

  // 🎯 คัดกรองผลลัพธ์ดักเอาเฉพาะตัวที่มีข้อมูล (Found) และสถานะต้องเป็น ACTIVE เท่านั้น
  const displayResults = results.filter((item) => item.status === "ACTIVE");

  const glossaryTags = [
    {
      acronym: "BO",
      title: "Back Office",
      desc: "สายงานปฏิบัติการส่วนหลัง ตรวจสอบระเบียนคำสั่ง ธุรกรรมซื้อขาย และสิทธิ์ควบคุมโครงสร้างภายใน",
    },
    {
      acronym: "MKT",
      title: "Marketing",
      desc: "กลุ่มงานเจ้าหน้าที่การตลาด (AE) ดูแลและจัดสรรโควตาสัญญากรรมสิทธิ์พอร์ตจองซื้อหลักทรัพย์ของลูกค้าในความรับผิดชอบ",
    },
    {
      acronym: "OPER",
      title: "Operations",
      desc: "ฝ่ายปฏิบัติการวิเคราะห์สถิติตลาดทุน ตรวจสอบรายการโอนย้ายเงิน และควบคุมแผงระบบซื้อขายหลักทรัพย์ประจำวัน",
    },
    {
      acronym: "IT",
      title: "Information Technology",
      desc: "ฝ่ายโครงสร้างพื้นฐานเทคโนโลยีสารสนเทศ ดูแลความปลอดภัยเน็ตเวิร์กองค์กร และบริหารจัดการบัญชีผู้ใช้งานผู้ถือสิทธิ์",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200 font-sans antialiased flex selection:bg-sky-500/30 selection:text-sky-300 w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
        <main className="w-full mx-auto px-8 py-12">
          {/* Header Dashboard Title */}
          <div className="w-full mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Unified Accounts Directory
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              แผงควบคุมตรวจสอบความปลอดภัย (IAM Dashboard)
              ทำการสืบค้นสถานะระเบียนสิทธิ์การเข้าถึงพนักงานขนานพร้อมกัน 8
              ฐานข้อมูลหลักในเครือกลุ่มบริษัทหลักทรัพย์ AIRA
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-6 flex gap-3 bg-[#131b2e] p-2 rounded-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/5 transition-all duration-300 w-full max-w-3xl"
            >
              <div className="flex-1 flex items-center gap-3 px-3">
                <svg
                  className="w-5 h-5 text-slate-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="ป้อนรหัสพนักงานคีย์ตรวจสอบ (เช่น 3959, s3966)..."
                  className="w-full bg-transparent py-2.5 text-white placeholder-slate-600 font-bold text-base focus:outline-none"
                />
              </div>

              {keyword.trim() && (
                <button
                  type="submit"
                  
                  disabled={loading || !isFormatValid}
                  className="px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl shadow-lg transition-all duration-150 min-w-[110px]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    "เริ่มสืบค้น"
                  )}
                </button>
              )}
            </form>
          </div>

          
          {searched && (
            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden w-full transition-all duration-300 mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#090d16] border-b border-slate-800 text-slate-400 font-black text-xs uppercase tracking-wider">
                      <th className="py-4.5 px-6">ระบบ (System)</th>
                      <th className="py-4.5 px-6">สถานะ (Status)</th>
                      <th className="py-4.5 px-6">ชื่อพนักงาน (Name)</th>
                      <th className="py-4.5 px-6">รหัสผู้ใช้งาน (Username)</th>
                      <th className="py-4.5 px-6">Authorize</th>
                      <th className="py-4.5 px-6">Role</th>
                      <th className="py-4.5 px-6">Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 font-medium text-[13px]">
                    {displayResults.length > 0 ? (
                      displayResults.map((item, idx) => {
                        const badgeStyle = getRoleBadgeStyle(item.role);

                        return (
                          <tr
                            key={`${item.system}-${item.username}-${idx}`}
                            className="transition-colors duration-150 hover:bg-slate-800/40"
                          >
                            <td className="py-4 px-6 font-black text-white text-sm tracking-wide">
                              {item.system}
                            </td>

                            <td className="py-4 px-6">
                              <span className="text-[10px] px-2.5 py-0.5 rounded-md font-black border uppercase tracking-wide bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                                {item.status}
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              <span className="text-slate-200 font-black text-[14px]">
                                {item.details?.fullName || item.username}
                              </span>
                            </td>

                            <td className="py-4 px-6 font-mono text-sky-400 font-bold text-sm">
                              {item.username}
                            </td>

                            <td className="py-4 px-6">
                              <span
                                className={`w-fit text-[10px] px-3 py-1 rounded font-black border uppercase tracking-wider ${badgeStyle}`}
                              >
                                {getShortAuthorize(item.role)}
                              </span>
                            </td>

                            <td className="py-4 px-6 font-bold text-slate-400 text-xs tracking-wide">
                              {getDisplayRole(item)}
                            </td>

                            <td className="py-4 px-6 font-bold text-slate-300 text-xs">
                              {getDisplayGroup(item)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-12 text-center font-bold text-slate-500 text-base"
                        >
                          ❌ ไม่พบระเบียนข้อมูลพนักงานที่มีสถานะ ACTIVE
                          ในระบบใดๆ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

         
          <div className="mt-12 w-full border-t border-slate-800/60 pt-8">
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>📖</span> บัญชีสัญลักษณ์ป้ายกำกับตัวย่อส่วนงานองค์กร (AIRA
              Enterprise Acronym Glossary)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {glossaryTags.map((tag) => (
                <div
                  key={tag.acronym}
                  className="bg-[#131b2e]/30 border border-slate-800/60 rounded-2xl p-4 backdrop-blur-sm shadow-lg transition-all duration-200 hover:border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs px-2 py-0.5 rounded-md font-mono font-black">
                      {tag.acronym}
                    </span>
                    <span className="text-xs font-black text-slate-200 uppercase tracking-wide">
                      {tag.title}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                    {tag.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
