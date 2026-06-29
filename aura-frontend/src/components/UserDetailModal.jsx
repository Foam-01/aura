import React from 'react';

function UserDetailModal({ isOpen, onClose, userData }) {
  if (!isOpen || !userData) return null;

  const renderRow = (label, value) => {
    let displayValue = String(value ?? '—');
    if (typeof value === 'object' && value !== null) {
      displayValue = JSON.stringify(value);
    }
    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-800/60 text-sm">
        <span className="text-slate-400 font-bold">{label}</span>
        <span className="col-span-2 text-white font-mono font-medium break-all selection:bg-sky-500/30">
          {displayValue}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#131b2e] border border-slate-700/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Modal */}
        <div className="p-6 bg-[#090d16] border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase mb-1 block w-fit">
              {userData.system} DATA MONITOR
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              {userData.details?.fullName || userData.username || 'Account Profile'}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30 transition-all font-black text-base"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider mb-2">🔑 Core Identity Credentials</h4>
            <div className="bg-[#090d16]/60 border border-slate-800/80 rounded-xl px-4 py-2">
              {renderRow('System Engine', userData.system)}
              {renderRow('User Status', userData.status)}
              {renderRow('Username (ID)', userData.username)}
              {/* 🟢 แก้ไขจาก renderRole เป็น renderRow เรียบร้อยครับ */}
              {renderRow('System Role', userData.role)} 
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-2">🖥️ System Flag & Database Logs</h4>
            <div className="bg-[#090d16]/60 border border-slate-800/80 rounded-xl px-4 py-2">
              {renderRow('Authorize Status', userData.authorize || 'H (High/Standard)')}
              {renderRow('Login Failed Count', userData.flag_login_fail ?? '0')}
              {renderRow('Force Password Reset', userData.flag_reset ?? '0')}
              {renderRow('Project Access Token', userData.project_access || 'BO')}
              {renderRow('Is Active Register', userData.is_active ?? '1')}
            </div>
          </div>

          {userData.details && Object.keys(userData.details).length > 0 && (
            <div>
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2">🏢 Organizational HR Metadata</h4>
              <div className="bg-[#090d16]/60 border border-slate-800/80 rounded-xl px-4 py-2">
                {Object.entries(userData.details).map(([key, val]) => (
                  <div key={key}>
                    {renderRow(`Meta: ${key}`, val)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#090d16]/50 border-t border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
          >
            ปิดหน้าต่างนี้
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetailModal;