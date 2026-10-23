import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, ChevronDown, User, Shield, Check, Database } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, setCurrentUser, accounts, dataMode, setDataMode } = useApp();
  const [time, setTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date: Thứ Hai, 28/4/2025
  const getDayOfWeek = (d: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[d.getDay()];
  };

  const formattedDate = `${getDayOfWeek(time)}, ${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()}`;
  const formattedTime = time.toTimeString().split(' ')[0];

  return (
    <header className="relative z-20 bg-gradient-to-r from-[#071f3d] via-[#0d3b66] to-[#015f8a] text-white shadow-md border-b border-cyan-500/30">
      {/* Background subtle circuit / high-tech glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Left: School Logo & Name */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex-shrink-0 w-13 h-13 rounded-full bg-white/95 p-1 flex items-center justify-center shadow-lg border-2 border-cyan-400/60">
            {/* SVG Crest of THPT Bùi Hữu Nghĩa with open book, torch, cogwheel */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-900 fill-current">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#00529b" strokeWidth="4" />
              <circle cx="50" cy="50" r="41" fill="none" stroke="#0088cc" strokeWidth="1.5" strokeDasharray="3 2" />
              {/* Torch */}
              <path d="M48 30 L52 30 L54 62 L46 62 Z" fill="#d97706" />
              <path d="M44 26 Q50 14 56 26 Q50 20 44 26 Z" fill="#dc2626" />
              {/* Open Book */}
              <path d="M26 62 C38 58 48 64 50 67 C52 64 62 58 74 62 C68 76 52 74 50 78 C48 74 32 76 26 62 Z" fill="#0284c7" />
              <path d="M50 67 L50 78" stroke="#ffffff" strokeWidth="2" />
              {/* Laurel branch leaves */}
              <circle cx="28" cy="46" r="3" fill="#10b981" />
              <circle cx="72" cy="46" r="3" fill="#10b981" />
              <circle cx="32" cy="36" r="3" fill="#10b981" />
              <circle cx="68" cy="36" r="3" fill="#10b981" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-wide uppercase text-white drop-shadow-sm font-serif">
              TRƯỜNG THPT BÙI HỮU NGHĨA
            </h1>
            <p className="text-xs md:text-sm text-cyan-200 italic font-serif">
              Giáo dục hôm nay – Vững bước tương lai
            </p>
          </div>
        </div>

        {/* Center: System Title */}
        <div className="hidden lg:flex flex-col items-center text-center">
          <h2 className="text-xl xl:text-2xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 drop-shadow">
            HỆ THỐNG QUẢN LÝ KHO THIẾT BỊ GDQP&AN
          </h2>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-sm text-cyan-200 font-medium">
              Giáo viên: <strong className="text-white font-bold">Ngô Quang Vinh</strong>
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-xs text-cyan-300/90 font-serif">Năm học 2024 - 2025</span>
          </div>
        </div>

        {/* Right: Date/Time & User Profile & Mode Switcher */}
        <div className="flex items-center space-x-4">
          {/* Real-time Clock */}
          <div className="hidden md:flex items-center space-x-2 bg-black/25 px-3 py-1.5 rounded-lg border border-cyan-500/25 text-right">
            <Calendar className="w-5 h-5 text-cyan-300 flex-shrink-0" />
            <div className="text-xs leading-tight">
              <div className="text-cyan-200">{formattedDate}</div>
              <div className="text-sm font-bold text-white tracking-widest flex items-center justify-end space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400 inline mr-0.5" />
                <span>{formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Data Mode Indicator / Toggle */}
          <button
            onClick={() => setDataMode(dataMode === 'demo' ? 'real' : 'demo')}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              dataMode === 'demo'
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
            }`}
            title="Nhấp để chuyển đổi giữa Dữ liệu mẫu (Demo) và Dữ liệu thực tế"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{dataMode === 'demo' ? 'Dữ liệu Demo' : 'Dữ liệu Thực'}</span>
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 bg-cyan-950/60 hover:bg-cyan-900/80 px-3 py-1.5 rounded-full border border-cyan-400/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-400 flex items-center justify-center text-white ring-2 ring-white/30">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left text-xs leading-tight hidden sm:block">
                <div className="font-bold text-white flex items-center">
                  <span>{currentUser.fullName}</span>
                </div>
                <div className="text-cyan-300 text-[11px]">{currentUser.roleTitle}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-cyan-300 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs text-slate-500 font-medium">Tài khoản đang đăng nhập</p>
                  <p className="text-sm font-bold text-blue-950">{currentUser.fullName}</p>
                  <p className="text-xs text-blue-700">{currentUser.email}</p>
                  <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-700">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    <span>Vai trò: {currentUser.roleTitle}</span>
                  </div>
                </div>

                <div className="p-2">
                  <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Chuyển nhanh vai trò thử nghiệm:
                  </p>
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setCurrentUser(acc);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md text-left transition-colors ${
                        currentUser.id === acc.id
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{acc.fullName}</div>
                        <div className="text-[10px] text-slate-500">{acc.roleTitle}</div>
                      </div>
                      {currentUser.id === acc.id && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 px-2 pt-2">
                  <button
                    onClick={() => {
                      setDataMode(dataMode === 'demo' ? 'real' : 'demo');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md flex items-center space-x-2"
                  >
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    <span>Đổi sang chế độ: {dataMode === 'demo' ? 'Dữ liệu Thực tế' : 'Dữ liệu Mẫu (Demo)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
