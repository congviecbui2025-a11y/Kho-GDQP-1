import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportEquipmentCatalogToExcel } from '../../utils/excelExport';
import {
  Package,
  Database,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  FileCheck,
  BarChart2,
  FileSpreadsheet,
  BookOpen,
  ArrowRightLeft,
  Sliders,
  Users,
  HardDriveDownload,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const {
    equipments,
    setCurrentModule,
    totalEquipmentTypes,
    totalQuantityBook,
    totalQuantityActual,
    auditDiscrepancy,
    activities,
    monthlyStats,
    showToast,
  } = useApp();

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Group colors for Donut chart
  const colorPalette = [
    '#0284c7', // TL AK - Sky Blue
    '#f97316', // CKC - Orange
    '#10b981', // B41 - Emerald Green
    '#6366f1', // RPD - Indigo
    '#a855f7', // MBT03 - Purple
    '#eab308', // Lựu đạn - Amber
    '#06b6d4', // Bao súng - Cyan
    '#3b82f6', // Bao đựng - Royal Blue
    '#ec4899', // Pink
    '#14b8a6', // Teal
  ];

  // Calculate percentages and donut chart angles
  const donutData = equipments.map((item, index) => {
    const qty = Number(item.quantityBook) || 0;
    const pct = totalQuantityBook > 0 ? (qty / totalQuantityBook) * 100 : 0;
    return {
      id: item.id,
      name: item.name,
      quantity: qty,
      percentage: pct.toFixed(1),
      color: colorPalette[index % colorPalette.length],
    };
  });

  // Calculate SVG donut paths
  let accumulatedAngle = 0;
  const radius = 60;
  const strokeWidth = 24;
  const center = 80;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = donutData.map((slice) => {
    const strokeDasharray = `${(slice.quantity / (totalQuantityBook || 1)) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += (slice.quantity / (totalQuantityBook || 1)) * circumference;
    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1920px] mx-auto font-serif">
      {/* 1. Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: School Image / Graphic */}
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative w-36 h-24 md:w-44 md:h-26 rounded-lg overflow-hidden border-2 border-blue-300 shadow-md flex-shrink-0 bg-slate-800">
            {/* Campus photo representation with real THPT Bùi Hữu Nghĩa building */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 to-transparent z-10" />
            <img
              src="/assets/aistudio/1.1.1_4c0b1110.png"
              alt="Trường THPT Bùi Hữu Nghĩa"
              className="w-full h-full object-cover object-top filter brightness-95 contrast-105"
              onError={(e) => {
                // fallback decorative graphic if image path differs
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute bottom-1 left-2 z-20 text-[10px] text-white font-bold tracking-tight">
              THPT BÙI HỮU NGHĨA
            </div>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              Chào mừng thầy <span className="text-blue-800">Ngô Quang Vinh</span>
            </h2>
            <p className="text-sm font-semibold text-blue-700 mt-0.5">
              Hệ thống quản lý kho thiết bị GDQP&AN
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Trường THPT Bùi Hữu Nghĩa - Quận Bình Thủy, TP Cần Thơ
            </p>
          </div>
        </div>

        {/* Right: National Defense Quote */}
        <div className="flex items-center space-x-3 bg-white/80 p-3.5 rounded-lg border border-blue-200 shadow-sm max-w-md w-full md:w-auto">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-800">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-700 italic leading-snug">
            “Giáo dục quốc phòng và an ninh
            <br />
            là nền tảng để xây dựng và bảo vệ Tổ quốc.”
          </p>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số loại thiết bị */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Tổng số loại thiết bị</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalEquipmentTypes}</div>
            <div className="text-xs text-slate-500">loại thiết bị</div>
          </div>
        </div>

        {/* Card 2: Tổng số lượng (theo sổ) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-sky-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Tổng số lượng (theo sổ)</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalQuantityBook}</div>
            <div className="text-xs text-slate-500">(khẩu/chiếc/bộ/quả...)</div>
          </div>
        </div>

        {/* Card 3: Tổng số lượng (thực tế) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Tổng số lượng (thực tế)</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalQuantityActual}</div>
            <div className="text-xs text-slate-500">(sau kiểm kê)</div>
          </div>
        </div>

        {/* Card 4: Chênh lệch kiểm kê */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Chênh lệch kiểm kê</div>
            <div className="text-2xl font-bold text-red-600 mt-0.5">{auditDiscrepancy}</div>
            <div className="text-xs text-red-500 font-medium">
              {auditDiscrepancy > 0 ? '(cần xử lý)' : '(đã khớp 100%)'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Table, Charts, Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: DANH MỤC THIẾT BỊ table (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-blue-700 to-sky-700 px-4 py-2.5 text-white font-bold text-sm tracking-wide flex justify-between items-center">
              <span>DANH MỤC THIẾT BỊ</span>
              <span className="text-xs text-sky-200 font-normal">Tồn kho hiện hành</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 text-center w-10">STT</th>
                    <th className="py-2.5 px-3">Mã thiết bị</th>
                    <th className="py-2.5 px-3">Tên thiết bị</th>
                    <th className="py-2.5 px-3 text-center">Đơn vị tính</th>
                    <th className="py-2.5 px-3 text-right">Số lượng theo sổ</th>
                    <th className="py-2.5 px-3 text-right">Số lượng thực tế</th>
                    <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {equipments.slice(0, 8).map((eq, index) => {
                    const isDiscrepant = eq.quantityBook !== eq.quantityActual;
                    return (
                      <tr
                        key={eq.id}
                        className={`hover:bg-blue-50/50 transition-colors ${
                          isDiscrepant ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center text-slate-500 font-medium">{index + 1}</td>
                        <td className="py-2 px-3 font-semibold text-blue-900">{eq.code}</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{eq.name}</td>
                        <td className="py-2 px-3 text-center text-slate-600">{eq.unit}</td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-800">{eq.quantityBook}</td>
                        <td
                          className={`py-2 px-3 text-right font-bold ${
                            isDiscrepant ? 'text-amber-700' : 'text-slate-800'
                          }`}
                        >
                          {eq.quantityActual}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center space-x-1.5 text-[11px] font-medium">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                eq.status === 'Đang bảo quản'
                                  ? 'bg-emerald-500'
                                  : eq.status === 'Cần kiểm tra'
                                  ? 'bg-amber-500'
                                  : eq.status === 'Đang sử dụng'
                                  ? 'bg-blue-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            <span
                              className={
                                eq.status === 'Đang bảo quản'
                                  ? 'text-emerald-700'
                                  : eq.status === 'Cần kiểm tra'
                                  ? 'text-amber-700'
                                  : eq.status === 'Đang sử dụng'
                                  ? 'text-blue-700'
                                  : 'text-red-700'
                              }
                            >
                              {eq.status}
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50 text-right">
            <button
              onClick={() => setCurrentModule('equipment')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold inline-flex items-center space-x-1 hover:underline"
            >
              <span>Xem chi tiết danh mục thiết bị</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Column: Charts (Donut + Bar) (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Donut Chart: THỐNG KÊ THEO NHÓM THIẾT BỊ */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
              THỐNG KÊ THEO NHÓM THIẾT BỊ
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* SVG Donut */}
              <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.id}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                      onMouseEnter={() => setActiveTooltip(`${seg.name}: ${seg.quantity} (${seg.percentage}%)`)}
                      onMouseLeave={() => setActiveTooltip(null)}
                    />
                  ))}
                </svg>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[11px] font-semibold text-slate-500">Tổng số</span>
                  <span className="text-xl font-bold text-slate-800 leading-tight">
                    {totalQuantityBook}
                  </span>
                </div>
              </div>

              {/* Legend with numbers and percentages */}
              <div className="flex-1 w-full space-y-1 text-xs">
                {donutData.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] font-mono flex-shrink-0 ml-2">
                      <span className="text-slate-500">({item.percentage}%)</span>
                      <span className="font-bold text-slate-800 w-5 text-right">{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {activeTooltip && (
              <div className="mt-2 text-center text-xs font-bold text-blue-800 bg-blue-50 py-1 rounded border border-blue-200">
                {activeTooltip}
              </div>
            )}
          </div>

          {/* Bar Chart: TÌNH HÌNH NHẬP - XUẤT - ĐIỀU CHỈNH */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                TÌNH HÌNH NHẬP - XUẤT - ĐIỀU CHỈNH
              </h3>
              <span className="text-[11px] text-slate-500">(Trong tháng 4/2025)</span>
            </div>

            <div className="h-32 flex items-end justify-around px-4 pt-4 border-b border-slate-200 pb-1 relative">
              {/* Background grid lines */}
              <div className="absolute inset-x-4 top-2 border-b border-dashed border-slate-100 text-[10px] text-slate-400">
                20
              </div>
              <div className="absolute inset-x-4 top-1/2 border-b border-dashed border-slate-100 text-[10px] text-slate-400">
                10
              </div>

              {/* Bar 1: Nhập */}
              <div className="flex flex-col items-center w-16 group">
                <span className="text-xs font-bold text-sky-600 mb-1 group-hover:scale-110 transition-transform">
                  {monthlyStats.inCount}
                </span>
                <div
                  className="w-12 bg-sky-500 rounded-t-sm transition-all duration-300 hover:bg-sky-600"
                  style={{ height: `${Math.min(100, (monthlyStats.inCount / 20) * 90)}px` }}
                />
              </div>

              {/* Bar 2: Xuất */}
              <div className="flex flex-col items-center w-16 group">
                <span className="text-xs font-bold text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
                  {monthlyStats.outCount}
                </span>
                <div
                  className="w-12 bg-emerald-500 rounded-t-sm transition-all duration-300 hover:bg-emerald-600"
                  style={{ height: `${Math.min(100, (monthlyStats.outCount / 20) * 90)}px` }}
                />
              </div>

              {/* Bar 3: Điều chỉnh */}
              <div className="flex flex-col items-center w-16 group">
                <span className="text-xs font-bold text-amber-600 mb-1 group-hover:scale-110 transition-transform">
                  {monthlyStats.adjustCount}
                </span>
                <div
                  className="w-12 bg-amber-500 rounded-t-sm transition-all duration-300 hover:bg-amber-600"
                  style={{ height: `${Math.min(100, (monthlyStats.adjustCount / 20) * 90)}px` }}
                />
              </div>
            </div>

            <div className="flex justify-around text-xs font-semibold text-slate-700 mt-2">
              <span className="w-16 text-center text-sky-700">Nhập</span>
              <span className="w-16 text-center text-emerald-700">Xuất</span>
              <span className="w-16 text-center text-amber-700">Điều chỉnh</span>
            </div>
          </div>
        </div>

        {/* Right Column: HOẠT ĐỘNG GẦN ĐÂY & THAO TÁC NHANH (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-4">
          {/* HOẠT ĐỘNG GẦN ĐÂY */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
              HOẠT ĐỘNG GẦN ĐÂY
            </h3>

            <div className="space-y-3">
              {activities.slice(0, 5).map((act) => {
                let iconBg = 'bg-blue-600';
                if (act.type === 'in') iconBg = 'bg-emerald-600';
                else if (act.type === 'out') iconBg = 'bg-sky-600';
                else if (act.type === 'audit') iconBg = 'bg-emerald-700';
                else if (act.type === 'adjust') iconBg = 'bg-amber-600';
                else if (act.type === 'login') iconBg = 'bg-cyan-600';

                return (
                  <div key={act.id} className="flex items-start space-x-2.5 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full ${iconBg} text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm text-[10px] font-bold`}
                    >
                      {act.type === 'in' ? '↓' : act.type === 'out' ? '↑' : act.type === 'audit' ? '✓' : act.type === 'adjust' ? '⚙' : '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-mono text-slate-400 text-[11px] font-semibold">{act.time}</span>
                        <span className="font-bold text-slate-800 truncate">{act.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 italic truncate">{act.subtitle}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* THAO TÁC NHANH (6 big action buttons) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
              THAO TÁC NHANH
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Button 1: Thêm thiết bị */}
              <button
                onClick={() => setCurrentModule('equipment')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 transition-all hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center mb-1 shadow-sm">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Thêm thiết bị</span>
              </button>

              {/* Button 2: Nhập kho */}
              <button
                onClick={() => setCurrentModule('transactions')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 transition-all hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center mb-1 shadow-sm">
                  <ArrowDownCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Nhập kho</span>
              </button>

              {/* Button 3: Xuất kho */}
              <button
                onClick={() => setCurrentModule('transactions')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shadow-sm">
                  <ArrowUpCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Xuất kho</span>
              </button>

              {/* Button 4: Kiểm kê */}
              <button
                onClick={() => setCurrentModule('audit')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 transition-all hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-1 shadow-sm">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Kiểm kê</span>
              </button>

              {/* Button 5: Báo cáo */}
              <button
                onClick={() => setCurrentModule('reports')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 transition-all hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1 shadow-sm">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Báo cáo</span>
              </button>

              {/* Button 6: Xuất Excel (Real file download) */}
              <button
                onClick={() => {
                  exportEquipmentCatalogToExcel(equipments);
                  showToast('Đang tải xuống tệp Excel danh mục thiết bị...', 'success');
                }}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 text-green-800 transition-all hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mb-1 shadow-sm">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Xuất Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom 7 Navigation Shortcut Cards (Matching Screenshot) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Module 2: Danh mục */}
        <button
          onClick={() => setCurrentModule('equipment')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start space-x-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Package className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="truncate">Danh mục thiết bị</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Quản lý thông tin thiết bị</p>
          </div>
        </button>

        {/* Module 3: Nhập - Xuất - Điều chỉnh */}
        <button
          onClick={() => setCurrentModule('transactions')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start space-x-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="truncate">Nhập - Xuất - Đ/C</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600" />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Ghi nhận biến động kho</p>
          </div>
        </button>

        {/* Module 4: Kiểm kê và đối chiếu */}
        <button
          onClick={() => setCurrentModule('audit')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start space-x-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="truncate">Kiểm kê & đối chiếu</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-600" />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">So sánh sổ sách và thực tế</p>
          </div>
        </button>

        {/* Module 5: Tình trạng thiết bị */}
        <button
          onClick={() => setCurrentModule('condition')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start space-x-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="truncate">Tình trạng thiết bị</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Theo dõi kỹ thuật, bảo dưỡng</p>
          </div>
        </button>

        {/* Module 6: Báo cáo và thống kê */}
        <button
          onClick={() => setCurrentModule('reports')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start space-x-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="truncate">Báo cáo & thống kê</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Tổng hợp số liệu, in biểu mẫu</p>
          </div>
        </button>

        {/* Module 7: Tài khoản và phân quyền */}
        <button
          onClick={() => setCurrentModule('accounts')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start space-x-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="truncate">Tài khoản & phân quyền</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-purple-600" />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Quản lý người dùng, vai trò</p>
          </div>
        </button>

        {/* Module 8: Sao lưu và phục hồi */}
        <button
          onClick={() => setCurrentModule('backup')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start space-x-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <HardDriveDownload className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="truncate">Sao lưu & phục hồi</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Bảo vệ & phục hồi dữ liệu</p>
          </div>
        </button>
      </div>
    </div>
  );
};
