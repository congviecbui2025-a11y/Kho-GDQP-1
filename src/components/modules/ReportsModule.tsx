import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportEquipmentCatalogToExcel, exportTransactionsToExcel } from '../../utils/excelExport';
import {
  BarChart2,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  X,
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const {
    equipments,
    transactions,
    totalEquipmentTypes,
    totalQuantityBook,
    totalQuantityActual,
    auditDiscrepancy,
  } = useApp();

  const [reportType, setReportType] = useState<'INVENTORY_BALANCE' | 'CATEGORY_SUMMARY' | 'TECHNICAL_STATUS'>(
    'INVENTORY_BALANCE'
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Năm học 2024 - 2025');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Group by category summary
  const categorySummary = useMemo(() => {
    const map = new Map<string, { count: number; bookQty: number; actualQty: number; goodCount: number }>();

    equipments.forEach((eq) => {
      const cur = map.get(eq.category) || { count: 0, bookQty: 0, actualQty: 0, goodCount: 0 };
      cur.count += 1;
      cur.bookQty += eq.quantityBook;
      cur.actualQty += eq.quantityActual;
      if (eq.status === 'Đang bảo quản') cur.goodCount += 1;
      map.set(eq.category, cur);
    });

    return Array.from(map.entries()).map(([name, val]) => ({
      name,
      ...val,
    }));
  }, [equipments]);

  // Inventory balance (Nhập - Xuất - Tồn)
  const balanceSummary = useMemo(() => {
    return equipments.map((eq) => {
      const ins = transactions
        .filter((t) => t.equipmentId === eq.id && t.type === 'IN' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.quantity, 0);

      const outs = transactions
        .filter((t) => t.equipmentId === eq.id && t.type === 'OUT' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.quantity, 0);

      const openingStock = eq.quantityBook - ins + outs;

      return {
        id: eq.id,
        code: eq.code,
        name: eq.name,
        unit: eq.unit,
        openingStock: Math.max(0, openingStock),
        inPeriod: ins,
        outPeriod: outs,
        closingBook: eq.quantityBook,
        closingActual: eq.quantityActual,
        diff: eq.quantityActual - eq.quantityBook,
      };
    });
  }, [equipments, transactions]);

  const handleExportExcel = () => {
    if (reportType === 'INVENTORY_BALANCE') {
      exportEquipmentCatalogToExcel(equipments);
    } else {
      exportTransactionsToExcel(transactions);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1920px] mx-auto font-serif">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <BarChart2 className="w-6 h-6 text-emerald-700" />
            <span>BÁO CÁO & THỐNG KÊ KHO THIẾT BỊ GDQP&AN</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp số liệu biến động kho, phân loại kỹ thuật và lập biểu mẫu thanh tra chính quy của Sở GD&ĐT
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất báo cáo Excel</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In biểu mẫu báo cáo (A4)</span>
          </button>
        </div>
      </div>

      {/* Tabs and Time Period Selection */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Report Types */}
        <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-100 w-full sm:w-auto">
          <button
            onClick={() => setReportType('INVENTORY_BALANCE')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              reportType === 'INVENTORY_BALANCE' ? 'bg-blue-800 text-white shadow-xs' : 'text-slate-700'
            }`}
          >
            Báo cáo Nhập - Xuất - Tồn
          </button>
          <button
            onClick={() => setReportType('CATEGORY_SUMMARY')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              reportType === 'CATEGORY_SUMMARY' ? 'bg-blue-800 text-white shadow-xs' : 'text-slate-700'
            }`}
          >
            Thống kê theo Nhóm thiết bị
          </button>
          <button
            onClick={() => setReportType('TECHNICAL_STATUS')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              reportType === 'TECHNICAL_STATUS' ? 'bg-blue-800 text-white shadow-xs' : 'text-slate-700'
            }`}
          >
            Tình trạng kỹ thuật
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
          <span className="font-bold text-slate-600 whitespace-nowrap">Kỳ báo cáo:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold bg-slate-50/50"
          >
            <option value="Tháng 04/2025">Tháng 04/2025</option>
            <option value="Học kỳ II (2024 - 2025)">Học kỳ II (2024 - 2025)</option>
            <option value="Học kỳ I (2024 - 2025)">Học kỳ I (2024 - 2025)</option>
            <option value="Năm học 2024 - 2025">Cả năm học 2024 - 2025</option>
          </select>
        </div>
      </div>

      {/* Report 1: BÁO CÁO NHẬP - XUẤT - TỒN */}
      {reportType === 'INVENTORY_BALANCE' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-blue-900 to-sky-900 text-white text-xs font-bold flex justify-between items-center">
            <span>BẢNG TỔNG HỢP BIẾN ĐỘNG NHẬP - XUẤT - TỒN ({selectedPeriod})</span>
            <span className="text-cyan-200 font-normal">Đơn vị: Khẩu / Quả / Cái / Bộ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="py-2.5 px-3 text-center w-10">STT</th>
                  <th className="py-2.5 px-3">Mã TB</th>
                  <th className="py-2.5 px-3">Tên thiết bị</th>
                  <th className="py-2.5 px-3 text-center">ĐVT</th>
                  <th className="py-2.5 px-3 text-right">Tồn đầu kỳ</th>
                  <th className="py-2.5 px-3 text-right text-cyan-800">Nhập trong kỳ</th>
                  <th className="py-2.5 px-3 text-right text-blue-800">Xuất trong kỳ</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-900">Tồn cuối (Sổ)</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-900">Tồn thực tế</th>
                  <th className="py-2.5 px-3 text-center">Chênh lệch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balanceSummary.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                    <td className="py-2 px-3 font-bold text-blue-900">{item.code}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2 px-3 text-center text-slate-600">{item.unit}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-700">{item.openingStock}</td>
                    <td className="py-2 px-3 text-right font-bold text-cyan-700">+{item.inPeriod}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-700">-{item.outPeriod}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900 bg-slate-50">
                      {item.closingBook}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-cyan-900 bg-slate-50">
                      {item.closingActual}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">
                      {item.diff === 0 ? (
                        <span className="text-emerald-700">0</span>
                      ) : (
                        <span className="text-red-600">{item.diff}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={4} className="py-2.5 px-3 text-center uppercase">
                    Tổng cộng toàn kho:
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {balanceSummary.reduce((s, i) => s + i.openingStock, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-800">
                    +{balanceSummary.reduce((s, i) => s + i.inPeriod, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-800">
                    -{balanceSummary.reduce((s, i) => s + i.outPeriod, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">{totalQuantityBook}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-cyan-900">{totalQuantityActual}</td>
                  <td className="py-2.5 px-3 text-center text-red-600 font-bold">{auditDiscrepancy}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: BÁO CÁO THEO NHÓM */}
      {reportType === 'CATEGORY_SUMMARY' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-blue-900 to-sky-900 text-white text-xs font-bold">
            THỐNG KÊ CƠ CẤU CHỦNG LOẠI THIẾT BỊ GDQP&AN
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="py-2.5 px-3 text-center w-10">STT</th>
                  <th className="py-2.5 px-3">Nhóm / Chủng loại thiết bị</th>
                  <th className="py-2.5 px-3 text-center">Số chủng loại</th>
                  <th className="py-2.5 px-3 text-right">Tổng SL sổ sách</th>
                  <th className="py-2.5 px-3 text-right">Tổng SL thực tế</th>
                  <th className="py-2.5 px-3 text-center">Tỷ trọng (%)</th>
                  <th className="py-2.5 px-3 text-center">Đang bảo quản tốt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categorySummary.map((cat, index) => {
                  const pct = totalQuantityBook > 0 ? ((cat.bookQty / totalQuantityBook) * 100).toFixed(1) : '0';
                  return (
                    <tr key={cat.name} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                      <td className="py-2 px-3 font-bold text-blue-950">{cat.name}</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-700">{cat.count} loại</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{cat.bookQty}</td>
                      <td className="py-2 px-3 text-right font-bold text-cyan-900">{cat.actualQty}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-700">{pct}%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-emerald-700 font-bold">
                          {cat.goodCount}/{cat.count} loại (
                          {Math.round((cat.goodCount / cat.count) * 100)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: TÌNH TRẠNG KỸ THUẬT */}
      {reportType === 'TECHNICAL_STATUS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-blue-900 to-sky-900 text-white text-xs font-bold">
            BẢNG ĐÁNH GIÁ CHẤT LƯỢNG KỸ THUẬT THIẾT BỊ PHỤC VỤ GIẢNG DẠY
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="py-2.5 px-3 text-center w-10">STT</th>
                  <th className="py-2.5 px-3">Mã TB</th>
                  <th className="py-2.5 px-3">Tên thiết bị</th>
                  <th className="py-2.5 px-3 text-center">ĐVT</th>
                  <th className="py-2.5 px-3 text-right">Số lượng</th>
                  <th className="py-2.5 px-3 text-center">Chất lượng</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3">Mô tả tình trạng kỹ thuật hiện hành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipments.map((eq, index) => (
                  <tr key={eq.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                    <td className="py-2 px-3 font-bold text-blue-900">{eq.code}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{eq.name}</td>
                    <td className="py-2 px-3 text-center text-slate-600">{eq.unit}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{eq.quantityBook}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">
                      {eq.conditionPercentage}%
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          eq.status === 'Đang bảo quản'
                            ? 'bg-emerald-100 text-emerald-800'
                            : eq.status === 'Cần kiểm tra'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {eq.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 leading-snug">{eq.conditionDescription}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Printable Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center no-print">
              <div className="font-bold flex items-center space-x-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                <span>BÁO CÁO CÔNG TÁC QUẢN LÝ THIẾT BỊ GDQP&AN</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In văn bản (A4)</span>
                </button>
                <button onClick={() => setShowPrintModal(false)} className="p-1 text-slate-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 font-serif text-slate-900 bg-white" id="printable-report">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div className="text-center w-72">
                  <div className="text-xs uppercase font-bold text-slate-800">SỞ GD&ĐT TP CẦN THƠ</div>
                  <div className="text-sm uppercase font-bold text-blue-900">
                    TRƯỜNG THPT BÙI HỮU NGHĨA
                  </div>
                  <div className="text-[11px] italic text-slate-600">Bộ môn GDQP&AN</div>
                  <div className="w-24 h-0.5 bg-slate-800 mx-auto mt-1" />
                </div>
                <div className="text-center w-72">
                  <div className="text-xs uppercase font-bold text-slate-800">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="text-xs font-bold text-slate-900">Độc lập - Tự do - Hạnh phúc</div>
                  <div className="w-32 h-0.5 bg-slate-800 mx-auto mt-1" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-6">
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                  BÁO CÁO TÌNH HÌNH QUẢN LÝ VÀ SỬ DỤNG THIẾT BỊ GDQP&AN
                </h2>
                <div className="text-xs italic text-slate-600 mt-1">Kỳ báo cáo: {selectedPeriod}</div>
              </div>

              <div className="text-xs leading-relaxed space-y-2 mb-4">
                <p>
                  Kính gửi: <strong>Ban Giám hiệu Trường THPT Bùi Hữu Nghĩa</strong>
                </p>
                <p>
                  Căn cứ vào kế hoạch giảng dạy môn Giáo dục Quốc phòng và An ninh năm học 2024 - 2025, Bộ phận
                  phụ trách kho thiết bị báo cáo số liệu tổng hợp như sau:
                </p>
                <div>
                  - Tổng số loại thiết bị đang quản lý: <strong>{totalEquipmentTypes} chủng loại</strong>
                </div>
                <div>
                  - Tổng số lượng theo sổ sách kế toán:{' '}
                  <strong>{totalQuantityBook} (khẩu/chiếc/bộ/quả)</strong>
                </div>
                <div>
                  - Tổng số lượng thực tế kiểm kê:{' '}
                  <strong>{totalQuantityActual} (khẩu/chiếc/bộ/quả)</strong>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse border border-slate-400 text-xs my-4">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-400 py-1.5 px-2 text-center w-8">STT</th>
                    <th className="border border-slate-400 py-1.5 px-2">Mã TB</th>
                    <th className="border border-slate-400 py-1.5 px-2">Tên thiết bị</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center w-12">ĐVT</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-right">Sổ sách</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-right">Thực tế</th>
                    <th className="border border-slate-400 py-1.5 px-2 text-center">Chất lượng</th>
                    <th className="border border-slate-400 py-1.5 px-2">Hiện trạng & Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {equipments.map((eq, index) => (
                    <tr key={eq.id}>
                      <td className="border border-slate-400 py-1 px-2 text-center">{index + 1}</td>
                      <td className="border border-slate-400 py-1 px-2 font-mono font-bold">{eq.code}</td>
                      <td className="border border-slate-400 py-1 px-2 font-bold">{eq.name}</td>
                      <td className="border border-slate-400 py-1 px-2 text-center">{eq.unit}</td>
                      <td className="border border-slate-400 py-1 px-2 text-right font-semibold">
                        {eq.quantityBook}
                      </td>
                      <td className="border border-slate-400 py-1 px-2 text-right font-bold">
                        {eq.quantityActual}
                      </td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-bold">
                        {eq.conditionPercentage}%
                      </td>
                      <td className="border border-slate-400 py-1 px-2 text-[11px]">{eq.conditionDescription}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 text-center mt-12 text-xs">
                <div>
                  <div className="font-bold uppercase">Người lập báo cáo / Phụ trách kho</div>
                  <div className="text-[11px] italic text-slate-500">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="font-bold text-blue-900">Thầy Ngô Quang Vinh</div>
                </div>

                <div>
                  <div className="font-bold uppercase">Hiệu trưởng / Phó Hiệu trưởng</div>
                  <div className="text-[11px] italic text-slate-500">(Ký, đóng dấu)</div>
                  <div className="h-16" />
                  <div className="font-bold">Thầy Nguyễn Văn An</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
