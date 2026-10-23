import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditItem } from '../../types';
import { exportAuditReportToExcel } from '../../utils/excelExport';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Users,
  Calendar,
  Save,
  Check,
  FileText,
  X,
} from 'lucide-react';

export const AuditModule: React.FC = () => {
  const {
    audits,
    updateAuditItem,
    autoAdjustAllDiscrepancies,
    completeAudit,
    currentUser,
    showToast,
  } = useApp();

  const currentAudit = audits[0]; // Active audit
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editActualQty, setEditActualQty] = useState<number>(0);
  const [editExplanation, setEditExplanation] = useState<string>('');
  const [editGood, setEditGood] = useState<number>(0);
  const [editNeedRepair, setEditNeedRepair] = useState<number>(0);
  const [editDamaged, setEditDamaged] = useState<number>(0);

  const [showPrintModal, setShowPrintModal] = useState(false);

  if (!currentAudit) {
    return (
      <div className="p-8 text-center text-slate-500 font-serif">
        <p>Không có đợt kiểm kê nào trong hệ thống.</p>
      </div>
    );
  }

  const handleStartEdit = (item: AuditItem) => {
    setEditingItemId(item.equipmentId);
    setEditActualQty(item.actualQuantity);
    setEditExplanation(item.explanation);
    setEditGood(item.qualityGood);
    setEditNeedRepair(item.qualityNeedRepair);
    setEditDamaged(item.qualityDamaged);
  };

  const handleSaveEdit = (item: AuditItem) => {
    const diff = editActualQty - item.bookQuantity;
    updateAuditItem(currentAudit.id, {
      ...item,
      actualQuantity: editActualQty,
      difference: diff,
      explanation: editExplanation,
      qualityGood: editGood,
      qualityNeedRepair: editNeedRepair,
      qualityDamaged: editDamaged,
      adjusted: diff === 0,
    });
    setEditingItemId(null);
    showToast(`Đã cập nhật số liệu kiểm kê cho ${item.equipmentName}!`, 'success');
  };

  const totalBook = currentAudit.items.reduce((sum, i) => sum + i.bookQuantity, 0);
  const totalActual = currentAudit.items.reduce((sum, i) => sum + i.actualQuantity, 0);
  const discrepancyItems = currentAudit.items.filter((i) => i.difference !== 0);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1920px] mx-auto font-serif">
      {/* Top Banner & Audit Overview */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-900 text-xs px-2.5 py-1 rounded font-bold font-mono">
              {currentAudit.code}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                currentAudit.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {currentAudit.status === 'COMPLETED'
                ? 'Đã hoàn thành kiểm kê'
                : `Đang kiểm kê (Tiến độ: ${currentAudit.progressPercentage}%)`}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mt-2">{currentAudit.name}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Ngày thực hiện: <strong>{currentAudit.date}</strong> | Thư ký: <strong>{currentAudit.committeeSecretary}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={() => exportAuditReportToExcel(currentAudit)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Biên bản Excel</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In Biên bản (A4)</span>
          </button>

          {currentUser.permissions.canPerformAudit && discrepancyItems.length > 0 && (
            <button
              onClick={() => autoAdjustAllDiscrepancies(currentAudit.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tự động tạo phiếu điều chỉnh ({discrepancyItems.length})</span>
            </button>
          )}

          {currentUser.permissions.canPerformAudit && currentAudit.status !== 'COMPLETED' && (
            <button
              onClick={() => completeAudit(currentAudit.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Khóa sổ & Hoàn thành</span>
            </button>
          )}
        </div>
      </div>

      {/* Committee & Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs">
          <div className="font-bold text-blue-950 flex items-center space-x-1.5 mb-2">
            <Users className="w-4 h-4 text-blue-700" />
            <span>HỘI ĐỒNG KIỂM KÊ TRƯỜNG THPT BÙI HỮU NGHĨA</span>
          </div>
          <div className="space-y-1 text-slate-700">
            <div>
              - <strong>Trưởng ban:</strong> {currentAudit.committeeLeader}
            </div>
            <div>
              - <strong>Thư ký:</strong> {currentAudit.committeeSecretary}
            </div>
            <div>
              - <strong>Ủy viên:</strong> {currentAudit.committeeMembers.join('; ')}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="text-slate-500 font-semibold">Tổng số lượng (Sổ sách)</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalBook}</div>
          <div className="text-[11px] text-slate-400">khẩu/chiếc/bộ/quả</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="text-slate-500 font-semibold">Chênh lệch cần xử lý</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              totalActual - totalBook === 0 ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {Math.abs(totalActual - totalBook)}
          </div>
          <div className="text-[11px] text-slate-500">
            {discrepancyItems.length > 0 ? `${discrepancyItems.length} mục có chênh lệch` : 'Đã khớp 100%'}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-blue-900 to-sky-900 text-white flex justify-between items-center text-xs font-bold">
          <span>BẢNG ĐỐI CHIẾU SỐ LƯỢNG SỔ SÁCH VÀ THỰC TẾ KIỂM KÊ</span>
          <span className="text-cyan-200 font-normal">
            Nhấp biểu tượng bút để chỉnh sửa số lượng thực tế kiểm kê
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                <th className="py-2.5 px-3 text-center w-10">STT</th>
                <th className="py-2.5 px-3">Mã TB</th>
                <th className="py-2.5 px-3">Tên thiết bị</th>
                <th className="py-2.5 px-3 text-center">ĐVT</th>
                <th className="py-2.5 px-3 text-right">Số lượng sổ</th>
                <th className="py-2.5 px-3 text-right">Số lượng thực</th>
                <th className="py-2.5 px-3 text-center">Chênh lệch</th>
                <th className="py-2.5 px-3 text-center">Tốt (100%)</th>
                <th className="py-2.5 px-3 text-center">Cần sửa</th>
                <th className="py-2.5 px-3 text-center">Hỏng</th>
                <th className="py-2.5 px-3">Giải trình nguyên nhân & kiến nghị</th>
                <th className="py-2.5 px-3 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentAudit.items.map((item, index) => {
                const isEditing = editingItemId === item.equipmentId;
                const isDiscrepant = item.difference !== 0;

                if (isEditing) {
                  return (
                    <tr key={item.equipmentId} className="bg-blue-50/80">
                      <td className="py-2.5 px-3 text-center font-bold">{index + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-900">{item.equipmentCode}</td>
                      <td className="py-2.5 px-3 font-bold">{item.equipmentName}</td>
                      <td className="py-2.5 px-3 text-center">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{item.bookQuantity}</td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={editActualQty}
                          onChange={(e) => setEditActualQty(Number(e.target.value))}
                          className="w-16 px-1.5 py-1 border border-blue-400 rounded text-right font-bold bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {editActualQty - item.bookQuantity}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={editGood}
                          onChange={(e) => setEditGood(Number(e.target.value))}
                          className="w-12 px-1 py-1 border border-slate-300 rounded text-center bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={editNeedRepair}
                          onChange={(e) => setEditNeedRepair(Number(e.target.value))}
                          className="w-12 px-1 py-1 border border-slate-300 rounded text-center bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={editDamaged}
                          onChange={(e) => setEditDamaged(Number(e.target.value))}
                          className="w-12 px-1 py-1 border border-slate-300 rounded text-center bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={editExplanation}
                          onChange={(e) => setEditExplanation(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleSaveEdit(item)}
                          className="p-1 text-emerald-700 hover:bg-emerald-100 rounded mr-1"
                          title="Lưu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={item.equipmentId}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      isDiscrepant ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-900">{item.equipmentCode}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.equipmentName}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">{item.bookQuantity}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.actualQuantity}</td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {item.difference === 0 ? (
                        <span className="text-emerald-700">0</span>
                      ) : item.difference > 0 ? (
                        <span className="text-blue-700 font-bold">+{item.difference}</span>
                      ) : (
                        <span className="text-red-600 font-bold">{item.difference}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-medium">{item.qualityGood}</td>
                    <td className="py-2.5 px-3 text-center text-amber-700 font-medium">
                      {item.qualityNeedRepair}
                    </td>
                    <td className="py-2.5 px-3 text-center text-red-700 font-medium">{item.qualityDamaged}</td>
                    <td className="py-2.5 px-3 text-slate-700 leading-snug">{item.explanation}</td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {currentUser.permissions.canPerformAudit && (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="px-2 py-1 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold"
                        >
                          Sửa số liệu
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Conclusion Box */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs">
          <div className="font-bold text-slate-800 mb-1">KẾT LUẬN & KIẾN NGHỊ CỦA HỘI ĐỒNG:</div>
          <p className="text-slate-700 italic leading-relaxed">{currentAudit.conclusion}</p>
        </div>
      </div>

      {/* Official Printable Audit Minutes Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Toolbar */}
            <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center no-print">
              <div className="font-bold flex items-center space-x-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                <span>BIÊN BẢN KIỂM KÊ THỰC TẾ KHO THIẾT BỊ GDQP&AN</span>
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

            {/* Document preview */}
            <div className="p-8 font-serif text-slate-900 bg-white" id="printable-audit">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div className="text-center w-72">
                  <div className="text-xs uppercase font-bold text-slate-800">SỞ GD&ĐT TP CẦN THƠ</div>
                  <div className="text-sm uppercase font-bold text-blue-900">
                    TRƯỜNG THPT BÙI HỮU NGHĨA
                  </div>
                  <div className="text-[11px] italic text-slate-600">Hội đồng kiểm kê kho GDQP&AN</div>
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
                  BIÊN BẢN KIỂM KÊ THỰC TẾ KHO THIẾT BỊ GDQP&AN
                </h2>
                <div className="text-xs italic text-slate-600 mt-1">
                  Đợt kiểm kê: <strong>{currentAudit.code}</strong> - Ngày thực hiện: {currentAudit.date}
                </div>
              </div>

              {/* Committee */}
              <div className="text-xs leading-relaxed mb-4 space-y-1">
                <div>
                  Hôm nay, ngày {currentAudit.date}, tại Kho thiết bị GDQP&AN Trường THPT Bùi Hữu Nghĩa, Hội đồng
                  kiểm kê tiến hành kiểm kê thực tế bao gồm các thành viên:
                </div>
                <div>1. {currentAudit.committeeLeader}</div>
                <div>2. {currentAudit.committeeSecretary}</div>
                {currentAudit.committeeMembers.map((m, idx) => (
                  <div key={idx}>
                    {idx + 3}. {m}
                  </div>
                ))}
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse border border-slate-400 text-xs my-4">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-400 py-2 px-2 text-center w-8">STT</th>
                    <th className="border border-slate-400 py-2 px-2">Mã TB</th>
                    <th className="border border-slate-400 py-2 px-2">Tên thiết bị</th>
                    <th className="border border-slate-400 py-2 px-2 text-center w-12">ĐVT</th>
                    <th className="border border-slate-400 py-2 px-2 text-right">Sổ sách</th>
                    <th className="border border-slate-400 py-2 px-2 text-right">Thực tế</th>
                    <th className="border border-slate-400 py-2 px-2 text-center">Chênh lệch</th>
                    <th className="border border-slate-400 py-2 px-2 text-center">Tốt</th>
                    <th className="border border-slate-400 py-2 px-2 text-center">Sửa</th>
                    <th className="border border-slate-400 py-2 px-2 text-center">Hỏng</th>
                    <th className="border border-slate-400 py-2 px-2">Ghi chú / Kiến nghị</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAudit.items.map((item, index) => (
                    <tr key={item.equipmentId}>
                      <td className="border border-slate-400 py-1.5 px-2 text-center">{index + 1}</td>
                      <td className="border border-slate-400 py-1.5 px-2 font-mono font-bold">
                        {item.equipmentCode}
                      </td>
                      <td className="border border-slate-400 py-1.5 px-2 font-bold">{item.equipmentName}</td>
                      <td className="border border-slate-400 py-1.5 px-2 text-center">{item.unit}</td>
                      <td className="border border-slate-400 py-1.5 px-2 text-right font-semibold">
                        {item.bookQuantity}
                      </td>
                      <td className="border border-slate-400 py-1.5 px-2 text-right font-bold">
                        {item.actualQuantity}
                      </td>
                      <td className="border border-slate-400 py-1.5 px-2 text-center font-bold">
                        {item.difference}
                      </td>
                      <td className="border border-slate-400 py-1.5 px-2 text-center">{item.qualityGood}</td>
                      <td className="border border-slate-400 py-1.5 px-2 text-center">
                        {item.qualityNeedRepair}
                      </td>
                      <td className="border border-slate-400 py-1.5 px-2 text-center">
                        {item.qualityDamaged}
                      </td>
                      <td className="border border-slate-400 py-1.5 px-2 italic text-[11px]">
                        {item.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Conclusion */}
              <div className="text-xs leading-relaxed my-4">
                <strong>Kết luận của Hội đồng:</strong> {currentAudit.conclusion}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 text-center mt-12 text-xs">
                <div>
                  <div className="font-bold uppercase">Thư ký Hội đồng</div>
                  <div className="text-[11px] italic text-slate-500">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="font-bold text-blue-900">Thầy Ngô Quang Vinh</div>
                </div>

                <div>
                  <div className="font-bold uppercase">Đại diện Thiết bị</div>
                  <div className="text-[11px] italic text-slate-500">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="font-bold">Cô Trần Thị Mai</div>
                </div>

                <div>
                  <div className="font-bold uppercase">Trưởng ban kiểm kê (BGH)</div>
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
