import { useEffect, useState } from 'react';
import { getAuditLogs } from '../services/search.service';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getAuditLogs();
        setLogs(res || []); 
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const totalSearches = logs.length;
  const uniqueKeywords = new Set(logs.map(log => log.search_key.toLowerCase().trim())).size;
  const uniqueUsers = new Set(logs.map(log => log.action_user)).size;

  return (
    // ปรับสีพื้นหลังหลักของหน้าให้เป็นโทนดาร์กเหมือนหน้าหลัก
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans antialiased flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="w-full mx-auto px-6 py-10">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight text-white mb-1">
              Security Audit Analytics
            </h2>
            <p className="text-slate-400 text-xs font-medium">
              หน้าจอสรุปรายงานและวิเคราะห์พฤติกรรมการสืบค้นข้อมูลสำคัญระบบกลาง AIRA
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Analytics Cards Section (เปลี่ยนเป็นธีมมืดและขอบสีนีออนจางๆ) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-lg">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">จำนวนการสืบค้นทั้งหมด</div>
                  <div className="text-3xl font-black text-white mt-2">{totalSearches} <span className="text-xs text-slate-500 font-bold">ครั้ง</span></div>
                </div>
                <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-lg">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">คีย์เวิร์ดที่ใช้ค้นหา (ไม่ซ้ำกัน)</div>
                  <div className="text-3xl font-black text-cyan-400 mt-2">{uniqueKeywords} <span className="text-xs text-slate-500 font-bold">คำ</span></div>
                </div>
                <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-lg">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">แอดมินที่เข้าใช้งานตรวจสอบ</div>
                  <div className="text-3xl font-black text-emerald-400 mt-2">{uniqueUsers} <span className="text-xs text-slate-500 font-bold">บัญชี</span></div>
                </div>
              </div>

              {/* ตารางประวัติ Log รายการสืบค้น (ปรับโทนดาร์กและใช้ Border สีเข้ม) */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
                <div className="p-5 border-b border-slate-800 bg-[#151c2c]">
                  <h3 className="text-sm font-black text-slate-200">บันทึกประวัติการสืบค้น (Audit Log Trail)</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#1f2937]/30 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="p-4 pl-6">ID</th>
                        <th className="p-4">แอดมินผู้สืบค้น</th>
                        <th className="p-4">คำค้นหา (Keyword)</th>
                        <th className="p-4">หมายเลข IP Address</th>
                        <th className="p-4">ข้อมูลเบราว์เซอร์</th>
                        <th className="p-4 pr-6">วัน-เวลาสืบค้น</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs font-semibold text-slate-300">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#1f2937]/40 transition-colors">
                          <td className="p-4 pl-6 font-mono text-slate-500">{log.id}</td>
                          <td className="p-4">
                            <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-slate-700">
                              {log.action_user}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-cyan-400">{log.search_key}</td>
                          <td className="p-4 font-mono text-slate-400">{log.ip_address}</td>
                          <td className="p-4 text-slate-500 max-w-[180px] truncate" title={log.browser_info}>
                            {log.browser_info}
                          </td>
                          <td className="p-4 pr-6 text-slate-400">
                            {new Date(log.created_at).toLocaleString('th-TH')}
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan="6" className="p-8 text-center font-bold text-slate-500 bg-[#1f2937]/10">
                            ยังไม่มีข้อมูลประวัติการสืบค้นบันทึกในตารางฐานข้อมูลขณะนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}