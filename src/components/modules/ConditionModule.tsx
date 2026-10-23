import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceRecord, EquipmentStatus } from '../../types';
import { exportMaintenanceRecordsToExcel } from '../../utils/excelExport';
import {
  Sliders,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  X,
  Search,
} from 'lucide-react';

export const ConditionModule: React.FC = () => {
  const {
    equipments,
    maintenanceRecords,
    addMaintenanceRecord,
    updateEquipmentCondition,
    currentUser,
    showToast,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [selectedEqId, setSelectedEqId] = useState(equipments[0]?.id || '');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceRecord['type']>('Lau dầu súng');
  const [technician, setTechnician] = useState('Thầy Ngô Quang Vinh');
  const [desc, setDesc] = useState('');
  const [condBefore, setCondBefore] = useState('');
  const [condAfter, setCondAfter] = useState('');
  const [nextDate, setNextDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [statusResult, setStatusResult] = useState<MaintenanceRecord['status']>('Đạt yêu cầu');

  const selectedEquipment = equipments.find((e) => e.id === selectedEqId) || equipments[0];

  const handleOpenModal = (equipmentId?: string) => {
    if (equipmentId) {
      setSelectedEqId(equipmentId);
    }
    const eq = equipments.find((e) => e.id === (equipmentId || selectedEqId)) || equipments[0];
    setTechnician(currentUser.fullName);
    setDesc(`Bảo dưỡng, vệ sinh chi tiết và kiểm tra an toàn cho ${eq?.name}`);
    setCondBefore(eq?.conditionDescription || 'Bình thường');
    setCondAfter('Đã tra dầu bảo quản, lau chùi sạch sẽ, hoạt động cơ bẩm trơn tru');
    setStatusResult('Đạt yêu cầu');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    const count = maintenanceRecords.length + 1;
    const now = new Date();
    const code = `BD-${String(count).padStart(2, '0')}/${now.getFullYear()}`;
    const dateStr = now.toISOString().slice(0, 10);

    const res = addMaintenanceRecord({
      code,
      equipmentId: selectedEquipment.id,
      equipmentCode: selectedEquipment.code,
      equipmentName: selectedEquipment.name,
      maintenanceDate: dateStr,
      technician,
      type: maintenanceType,
      description: desc,
      conditionBefore: condBefore,
      conditionAfter: condAfter,
      nextScheduledDate: nextDate,
      status: statusResult,
    });

    if (res.success) {
      setIsModalOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const filteredRecords = maintenanceRecords.filter(
    (r) =>
      r.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.technician.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1920px] mx-auto font-serif">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-indigo-700" />
            <span>TÌNH TRẠNG KỸ THUẬT & BẢO QUẢN THIẾT BỊ GDQP&AN</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi hệ số kỹ thuật, lịch trình tra dầu mỡ súng bộ binh, chống ẩm và kiểm tra an toàn huấn luyện
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap">
          <button
            onClick={() => exportMaintenanceRecordsToExcel(maintenanceRecords)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Nhật ký Excel ({maintenanceRecords.length})</span>
          </button>

          {currentUser.permissions.canManageCondition && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi nhận bảo dưỡng mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Equipment Technical Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {equipments.map((eq) => {
          const isCheck = eq.status === 'Cần kiểm tra';
          const isDamaged = eq.status === 'Hư hỏng';

          return (
            <div
              key={eq.id}
              className={`bg-white rounded-xl border p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                isCheck
                  ? 'border-amber-300 bg-amber-50/20'
                  : isDamaged
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {eq.code}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      eq.status === 'Đang bảo quản'
                        ? 'bg-emerald-100 text-emerald-800'
                        : eq.status === 'Cần kiểm tra'
                        ? 'bg-amber-100 text-amber-800'
                        : eq.status === 'Đang sử dụng'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {eq.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-800 mt-2">{eq.name}</h3>
                <div className="text-[11px] text-slate-500 font-medium">
                  {eq.category} • Số lượng: {eq.quantityBook} {eq.unit}
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">Hệ số kỹ thuật tốt:</span>
                    <span
                      className={
                        eq.conditionPercentage >= 90
                          ? 'text-emerald-700'
                          : eq.conditionPercentage >= 75
                          ? 'text-amber-700'
                          : 'text-red-600'
                      }
                    >
                      {eq.conditionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        eq.conditionPercentage >= 90
                          ? 'bg-emerald-500'
                          : eq.conditionPercentage >= 75
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${eq.conditionPercentage}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {eq.conditionDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Bảo dưỡng: <strong>{eq.lastMaintenanceDate}</strong>
                </span>

                {currentUser.permissions.canManageCondition && (
                  <button
                    onClick={() => handleOpenModal(eq.id)}
                    className="text-xs text-indigo-700 hover:text-indigo-900 font-bold hover:underline"
                  >
                    Bảo dưỡng →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Maintenance History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3.5 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="font-bold text-xs uppercase tracking-wide flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-cyan-300" />
            <span>NHẬT KÝ BẢO QUẢN, BẢO DƯỠNG & SỬA CHỮA KỸ THUẬT</span>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm nhật ký..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-2.5 px-3 text-center w-10">STT</th>
                <th className="py-2.5 px-3">Mã phiếu</th>
                <th className="py-2.5 px-3">Tên thiết bị</th>
                <th className="py-2.5 px-3 text-center">Mã TB</th>
                <th className="py-2.5 px-3">Ngày thực hiện</th>
                <th className="py-2.5 px-3">Người bảo dưỡng</th>
                <th className="py-2.5 px-3">Hình thức bảo dưỡng</th>
                <th className="py-2.5 px-3">Chi tiết công việc</th>
                <th className="py-2.5 px-3 text-center">Kết quả</th>
                <th className="py-2.5 px-3 text-center">Ngày hẹn tiếp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r, index) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-900 whitespace-nowrap">{r.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{r.equipmentName}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600 font-semibold">
                    {r.equipmentCode}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{r.maintenanceDate}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{r.technician}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-semibold">{r.type}</td>
                  <td className="py-2.5 px-3 text-slate-600 leading-snug">{r.description}</td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'Đạt yêu cầu'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'Cần kiểm tra lại'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600 font-mono text-[11px]">
                    {r.nextScheduledDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base font-serif">LẬP PHIẾU BẢO DƯỠNG KỸ THUẬT</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-serif">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thiết bị bảo dưỡng</label>
                  <select
                    value={selectedEqId}
                    onChange={(e) => setSelectedEqId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {equipments.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code} - {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hình thức bảo dưỡng</label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value as MaintenanceRecord['type'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Lau dầu súng">Lau dầu súng</option>
                    <option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</option>
                    <option value="Sửa chữa hỏng hóc">Sửa chữa hỏng hóc</option>
                    <option value="Kiểm tra an toàn">Kiểm tra an toàn</option>
                    <option value="Thay phụ kiện">Thay phụ kiện</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người thực hiện</label>
                  <input
                    type="text"
                    required
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày hẹn bảo dưỡng tiếp</label>
                  <input
                    type="date"
                    required
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chi tiết công việc thực hiện</label>
                <textarea
                  rows={2}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Tháo lắp, làm sạch muội thuốc, bôi mỡ súng chuyên dụng..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tình trạng trước BD</label>
                  <input
                    type="text"
                    value={condBefore}
                    onChange={(e) => setCondBefore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tình trạng sau BD</label>
                  <input
                    type="text"
                    value={condAfter}
                    onChange={(e) => setCondAfter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kết quả đánh giá</label>
                <select
                  value={statusResult}
                  onChange={(e) => setStatusResult(e.target.value as MaintenanceRecord['status'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="Đạt yêu cầu">Đạt yêu cầu (Sẵn sàng phục vụ huấn luyện)</option>
                  <option value="Cần kiểm tra lại">Cần kiểm tra lại</option>
                  <option value="Không đạt">Không đạt (Đề xuất sửa chữa chuyên sâu / thay thế)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold shadow-md"
                >
                  Ghi nhật ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
