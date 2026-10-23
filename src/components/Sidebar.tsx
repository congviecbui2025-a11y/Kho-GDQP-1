import React from 'react';
import { useApp } from '../context/AppContext';
import { ModuleType } from '../types';
import {
  Home,
  ClipboardList,
  ArrowLeftRight,
  ClipboardCheck,
  Sliders,
  BarChart3,
  Users,
  Database,
  School,
} from 'lucide-react';

interface MenuItem {
  id: ModuleType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const { currentModule, setCurrentModule } = useApp();

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Trang tổng quan', icon: Home },
    { id: 'equipment', label: 'Danh mục thiết bị', icon: ClipboardList },
    { id: 'transactions', label: 'Nhập - Xuất - Điều chỉnh', icon: ArrowLeftRight },
    { id: 'audit', label: 'Kiểm kê và đối chiếu', icon: ClipboardCheck },
    { id: 'condition', label: 'Tình trạng thiết bị', icon: Sliders },
    { id: 'reports', label: 'Báo cáo và thống kê', icon: BarChart3 },
    { id: 'accounts', label: 'Tài khoản và phân quyền', icon: Users },
    { id: 'backup', label: 'Sao lưu và phục hồi dữ liệu', icon: Database },
  ];

  return (
    <aside className="w-64 bg-[#081e36] text-slate-200 flex flex-col justify-between shadow-xl flex-shrink-0 border-r border-[#0e2a4a]">
      {/* Menu links */}
      <div className="py-4 px-3 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentModule(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#0082c8] text-white shadow-md shadow-blue-500/20 translate-x-1'
                  : 'text-slate-300 hover:bg-[#0f2e52] hover:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-md ${
                  isActive ? 'text-white' : 'text-cyan-400 group-hover:text-cyan-300'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
              </div>
              <span className="font-serif tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Illustration & School Quote */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-b from-[#0e2c4d]/80 to-[#091b30] border border-cyan-500/20 text-center relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

        {/* School Building Vector Illustration */}
        <div className="flex justify-center mb-2 text-cyan-400/80">
          <svg viewBox="0 0 160 80" className="w-36 h-20 fill-none stroke-current stroke-[1.5]">
            {/* Center Main Building Pediment */}
            <polygon points="80,10 40,30 120,30" stroke="#00b4d8" fill="rgba(0,180,216,0.1)" />
            <rect x="50" y="30" width="60" height="42" stroke="#00b4d8" fill="rgba(0,180,216,0.05)" />
            {/* Pillars */}
            <line x1="58" y1="30" x2="58" y2="72" stroke="#0284c7" strokeWidth="2" />
            <line x1="72" y1="30" x2="72" y2="72" stroke="#0284c7" strokeWidth="2" />
            <line x1="88" y1="30" x2="88" y2="72" stroke="#0284c7" strokeWidth="2" />
            <line x1="102" y1="30" x2="102" y2="72" stroke="#0284c7" strokeWidth="2" />
            {/* Steps & Base */}
            <rect x="42" y="72" width="76" height="4" fill="#00b4d8" />
            <rect x="36" y="76" width="88" height="4" fill="#00b4d8" />
            {/* Wings */}
            <rect x="15" y="36" width="25" height="36" stroke="#0284c7" />
            <line x1="22" y1="42" x2="33" y2="42" stroke="#0284c7" />
            <line x1="22" y1="52" x2="33" y2="52" stroke="#0284c7" />
            <line x1="22" y1="62" x2="33" y2="62" stroke="#0284c7" />

            <rect x="120" y="36" width="25" height="36" stroke="#0284c7" />
            <line x1="127" y1="42" x2="138" y2="42" stroke="#0284c7" />
            <line x1="127" y1="52" x2="138" y2="52" stroke="#0284c7" />
            <line x1="127" y1="62" x2="138" y2="62" stroke="#0284c7" />
            {/* Star in pediment */}
            <circle cx="80" cy="22" r="3" fill="#38bdf8" />
          </svg>
        </div>

        <p className="text-xs italic text-cyan-200/90 font-serif leading-relaxed">
          “Vì một nền giáo dục
          <br />
          <strong className="text-white font-semibold">vững mạnh - an toàn - nhân văn</strong>”
        </p>

        <div className="mt-2 text-[10px] text-slate-400 font-serif">
          THPT Bùi Hữu Nghĩa • Cần Thơ
        </div>
      </div>
    </aside>
  );
};
