import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import { exportTransactionsToExcel } from '../../utils/excelExport';
import {
  ArrowLeftRight,
  ArrowDownCircle,
  ArrowUpCircle,
  SlidersHorizontal,
  Plus,
  Search,
  Printer,
  FileSpreadsheet,
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  FileText,
} from 'lucide-react';

export const TransactionsModule: React.FC = () => {
  const { transactions, equipments, createTransaction, cancelTransaction, currentUser, showToast } = useApp();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionType>('OUT'); // Default to outward since school loans weapons for classes most often
  const [selectedTransactionForPrint, setSelectedTransactionForPrint] = useState<Transaction | null>(null);

  // Form state
  const [formEquipmentId, setFormEquipmentId] = useState<string>(equipments[0]?.id || '');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formPerson, setFormPerson] = useState<string>('');
  const [formDeptOrClass, setFormDeptOrClass] = useState<string>('');
  const [formPurpose, setFormPurpose] = useState<string>('');
  const [formDocRef, setFormDocRef] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  const selectedEquipment = useMemo(() => {
    return equipments.find((e) => e.id === formEquipmentId) || equipments[0];
  }, [equipments, formEquipmentId]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = filterType === 'ALL' || t.type === filterType;
      const matchSearch =
        t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.personInCharge.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.departmentOrClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [transactions, filterType, searchTerm]);

  const handleOpenCreateModal = (type: TransactionType) => {
    setActiveTab(type);
    if (equipments.length > 0) {
      setFormEquipmentId(equipments[0].id);
    }
    setFormQuantity(type === 'OUT' ? 3 : 5);
    setFormPerson(type === 'OUT' ? 'Cô Lê Thị Lan' : 'Thầy Ngô Quang Vinh');
    setFormDeptOrClass(
      type === 'OUT'
        ? 'Lớp 11A2 (Tiết 3-4 GDQP&AN)'
        : type === 'IN'
        ? 'Sở GD&ĐT TP Cần Thơ cấp mới'
        : 'Hội đồng kiểm kê kho trường'
    );
    setFormPurpose(
      type === 'OUT'
        ? 'Thực hành bài giảng kỹ thuật bắn súng tiểu liên AK'
        : type === 'IN'
        ? 'Bổ sung thiết bị phục vụ giảng dạy năm học mới'
        : 'Điều chỉnh số lượng sau kiểm kê định kỳ'
    );
    setFormDocRef(`KH-${Math.floor(Math.random() * 90 + 10)}/GDQP`);
    setFormNotes('');
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEquipment) {
      showToast('Vui lòng chọn thiết bị hợp lệ', 'error');
      return;
    }

    if (formQuantity <= 0) {
      showToast('Số lượng phải lớn hơn 0', 'error');
      return;
    }

    // Auto-generate code
    const now = new Date();
    const count = transactions.length + 1;
    const prefix = activeTab === 'IN' ? 'Nhập kho' : activeTab === 'OUT' ? 'Xuất kho' : 'Điều chỉnh';
    const code = `Phiếu ${prefix} số ${count}/${now.getFullYear()}`;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const res = createTransaction({
      code,
      type: activeTab,
      date: dateStr,
      equipmentId: selectedEquipment.id,
      equipmentCode: selectedEquipment.code,
      equipmentName: selectedEquipment.name,
      quantity: Number(formQuantity),
      unit: selectedEquipment.unit,
      personInCharge: formPerson.trim() || currentUser.fullName,
      departmentOrClass: formDeptOrClass.trim(),
      purpose: formPurpose.trim(),
      documentRef: formDocRef.trim(),
      notes: formNotes.trim(),
    });

    if (res.success) {
      setIsCreateModalOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCancelTransaction = (t: Transaction) => {
    if (confirm(`Bạn có chắc chắn muốn hủy phiếu "${t.code}"? Số lượng sẽ được hoàn tác vào tồn kho thiết bị.`)) {
      cancelTransaction(t.id);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1920px] mx-auto font-serif">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <ArrowLeftRight className="w-6 h-6 text-sky-700" />
            <span>QUẢN LÝ BIẾN ĐỘNG KHO: NHẬP - XUẤT - ĐIỀU CHỈNH</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận chính xác từng lần xuất mượn phục vụ tiết học, tiếp nhận mới và điều chỉnh số liệu sau kiểm kê
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap">
          <button
            onClick={() => exportTransactionsToExcel(filteredTransactions)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel ({filteredTransactions.length})</span>
          </button>

          {currentUser.permissions.canCreateTransaction && (
            <>
              <button
                onClick={() => handleOpenCreateModal('IN')}
                className="flex items-center space-x-1 px-3 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>+ Lập phiếu Nhập</span>
              </button>

              <button
                onClick={() => handleOpenCreateModal('OUT')}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>+ Lập phiếu Xuất</span>
              </button>

              <button
                onClick={() => handleOpenCreateModal('ADJUST')}
                className="flex items-center space-x-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>+ Điều chỉnh</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo số phiếu, tên thiết bị, người nhận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'ALL'
                ? 'bg-blue-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('IN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'IN'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Nhập kho ({transactions.filter((t) => t.type === 'IN').length})
          </button>
          <button
            onClick={() => setFilterType('OUT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'OUT'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Xuất kho ({transactions.filter((t) => t.type === 'OUT').length})
          </button>
          <button
            onClick={() => setFilterType('ADJUST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'ADJUST'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Điều chỉnh ({transactions.filter((t) => t.type === 'ADJUST').length})
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white font-bold">
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3">Số phiếu</th>
                <th className="py-3 px-3 text-center">Phân loại</th>
                <th className="py-3 px-3">Thời gian</th>
                <th className="py-3 px-3">Tên thiết bị</th>
                <th className="py-3 px-3 text-center">Mã TB</th>
                <th className="py-3 px-3 text-right">Số lượng</th>
                <th className="py-3 px-3 text-center">ĐVT</th>
                <th className="py-3 px-3">Người giao / nhận</th>
                <th className="py-3 px-3">Đơn vị / Lớp</th>
                <th className="py-3 px-3">Mục đích sử dụng</th>
                <th className="py-3 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500 italic">
                    Không có phiếu giao dịch nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, index) => {
                  const isCancelled = t.status === 'CANCELLED';

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        isCancelled ? 'bg-slate-100/70 opacity-60 line-through' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-900 whitespace-nowrap">{t.code}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            t.type === 'IN'
                              ? 'bg-cyan-100 text-cyan-800'
                              : t.type === 'OUT'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span>{t.type === 'IN' ? '↓ Nhập' : t.type === 'OUT' ? '↑ Xuất' : '⚙ Đ/C'}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{t.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{t.equipmentName}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 font-semibold">
                        {t.equipmentCode}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 text-sm">
                        {t.type === 'IN' ? `+${t.quantity}` : t.type === 'OUT' ? `-${t.quantity}` : t.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-600">{t.unit}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium truncate max-w-xs">
                        {t.personInCharge}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{t.departmentOrClass}</td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{t.purpose}</td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setSelectedTransactionForPrint(t)}
                            title="In phiếu chính thức"
                            className="p-1 rounded text-blue-700 hover:bg-blue-100"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {!isCancelled && currentUser.permissions.canCreateTransaction && (
                            <button
                              onClick={() => handleCancelTransaction(t)}
                              title="Hủy phiếu & hoàn tác kho"
                              className="p-1 rounded text-rose-700 hover:bg-rose-100"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lập Phiếu */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-900 to-sky-800 text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base font-serif">
                LẬP PHIẾU {activeTab === 'IN' ? 'NHẬP KHO' : activeTab === 'OUT' ? 'XUẤT KHO' : 'ĐIỀU CHỈNH KHO'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-serif">
              {/* Type Switcher Tabs inside modal */}
              <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('OUT')}
                  className={`flex-1 py-1.5 rounded-md font-bold transition-colors ${
                    activeTab === 'OUT' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700'
                  }`}
                >
                  Xuất kho (Mượn học)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('IN')}
                  className={`flex-1 py-1.5 rounded-md font-bold transition-colors ${
                    activeTab === 'IN' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-700'
                  }`}
                >
                  Nhập kho (Cấp mới / Trả)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ADJUST')}
                  className={`flex-1 py-1.5 rounded-md font-bold transition-colors ${
                    activeTab === 'ADJUST' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700'
                  }`}
                >
                  Điều chỉnh (Sau kiểm kê)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chọn Thiết bị */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chọn thiết bị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formEquipmentId}
                    onChange={(e) => setFormEquipmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {equipments.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code} - {eq.name} (Tồn sổ: {eq.quantityBook} {eq.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Số lượng */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số lượng {activeTab === 'IN' ? 'nhập' : activeTab === 'OUT' ? 'xuất' : 'điều chỉnh'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      required
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                    />
                    <span className="font-bold text-slate-600 w-16">{selectedEquipment?.unit}</span>
                  </div>
                </div>

                {/* Thông tin tồn kho hiện tại */}
                <div className="sm:col-span-2 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 flex items-center justify-between">
                  <div className="text-slate-700">
                    Tồn kho sổ sách hiện tại:{' '}
                    <strong className="text-blue-900 font-bold">
                      {selectedEquipment?.quantityBook} {selectedEquipment?.unit}
                    </strong>{' '}
                    | Thực tế:{' '}
                    <strong className="text-cyan-900 font-bold">
                      {selectedEquipment?.quantityActual} {selectedEquipment?.unit}
                    </strong>
                  </div>
                  {activeTab === 'OUT' && (
                    <div className="text-[11px] font-bold text-emerald-800">
                      Tồn sau xuất:{' '}
                      {Math.max(0, (selectedEquipment?.quantityBook || 0) - formQuantity)}{' '}
                      {selectedEquipment?.unit}
                    </div>
                  )}
                </div>

                {/* Người giao / nhận */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {activeTab === 'OUT' ? 'Người nhận / Giáo viên phụ trách' : 'Người giao / Nguồn cấp'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPerson}
                    onChange={(e) => setFormPerson(e.target.value)}
                    placeholder="VD: Cô Lê Thị Lan..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Đơn vị / Lớp */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đơn vị / Khối lớp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formDeptOrClass}
                    onChange={(e) => setFormDeptOrClass(e.target.value)}
                    placeholder="VD: Lớp 11A2, Tổ GDQP&AN..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Chứng từ kèm theo */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số hiệu văn bản / Kế hoạch dạy</label>
                  <input
                    type="text"
                    value={formDocRef}
                    onChange={(e) => setFormDocRef(e.target.value)}
                    placeholder="VD: KHGD-05/GDQP..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Mục đích */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mục đích sử dụng</label>
                  <input
                    type="text"
                    value={formPurpose}
                    onChange={(e) => setFormPurpose(e.target.value)}
                    placeholder="VD: Thực hành tiết 3-4 tháo lắp súng..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú (Hạn trả, tình trạng khi giao)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Hẹn trả trước 11h15, súng nguyên vẹn..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md"
                >
                  Lập phiếu ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Slip Modal (Xem trước và in phiếu chính quy theo quy định trường học) */}
      {selectedTransactionForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Top Toolbar */}
            <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center no-print">
              <div className="font-bold flex items-center space-x-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                <span>XEM TRƯỚC PHIẾU KHO CHÍNH THỨC</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In phiếu (A4)</span>
                </button>
                <button
                  onClick={() => setSelectedTransactionForPrint(null)}
                  className="p-1 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="p-8 font-serif text-slate-900 bg-white" id="printable-slip">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div className="text-center w-64">
                  <div className="text-xs uppercase font-bold text-slate-800">SỞ GD&ĐT TP CẦN THƠ</div>
                  <div className="text-sm uppercase font-bold text-blue-900">
                    TRƯỜNG THPT BÙI HỮU NGHĨA
                  </div>
                  <div className="text-[11px] italic text-slate-600">Tổ Thể dục - GDQP&AN</div>
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
                  {selectedTransactionForPrint.type === 'IN'
                    ? 'PHIẾU NHẬP KHO THIẾT BỊ GDQP&AN'
                    : selectedTransactionForPrint.type === 'OUT'
                    ? 'PHIẾU XUẤT KHO THIẾT BỊ GDQP&AN'
                    : 'PHIẾU ĐIỀU CHỈNH KHO THIẾT BỊ'}
                </h2>
                <div className="text-xs italic text-slate-600 mt-1">
                  Mã chứng từ: <strong>{selectedTransactionForPrint.code}</strong> | Ngày:{' '}
                  {selectedTransactionForPrint.date}
                </div>
              </div>

              {/* Content Details */}
              <div className="space-y-3 text-xs leading-relaxed mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    - Người lập phiếu: <strong>{selectedTransactionForPrint.createdBy}</strong>
                  </div>
                  <div>
                    - Giáo viên phụ trách kho:{' '}
                    <strong className="text-blue-950 font-bold">Thầy Ngô Quang Vinh</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    - Họ tên người{' '}
                    {selectedTransactionForPrint.type === 'OUT' ? 'nhận thiết bị' : 'giao thiết bị'}:{' '}
                    <strong>{selectedTransactionForPrint.personInCharge}</strong>
                  </div>
                  <div>
                    - Đơn vị / Khối lớp: <strong>{selectedTransactionForPrint.departmentOrClass}</strong>
                  </div>
                </div>

                <div>
                  - Mục đích:{' '}
                  <span>{selectedTransactionForPrint.purpose || 'Phục vụ chương trình huấn luyện GDQP&AN'}</span>
                </div>

                <div>
                  - Căn cứ văn bản:{' '}
                  <span>{selectedTransactionForPrint.documentRef || 'Kế hoạch giảng dạy bộ môn'}</span>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse border border-slate-400 text-xs my-4">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-400 py-2 px-3 text-center w-12">STT</th>
                    <th className="border border-slate-400 py-2 px-3">Mã thiết bị</th>
                    <th className="border border-slate-400 py-2 px-3">Tên thiết bị / Quy cách</th>
                    <th className="border border-slate-400 py-2 px-3 text-center w-20">ĐVT</th>
                    <th className="border border-slate-400 py-2 px-3 text-right w-24">Số lượng</th>
                    <th className="border border-slate-400 py-2 px-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-400 py-2.5 px-3 text-center">1</td>
                    <td className="border border-slate-400 py-2.5 px-3 font-mono font-bold">
                      {selectedTransactionForPrint.equipmentCode}
                    </td>
                    <td className="border border-slate-400 py-2.5 px-3 font-bold">
                      {selectedTransactionForPrint.equipmentName}
                    </td>
                    <td className="border border-slate-400 py-2.5 px-3 text-center">
                      {selectedTransactionForPrint.unit}
                    </td>
                    <td className="border border-slate-400 py-2.5 px-3 text-right font-bold text-sm">
                      {selectedTransactionForPrint.quantity}
                    </td>
                    <td className="border border-slate-400 py-2.5 px-3 italic">
                      {selectedTransactionForPrint.notes || 'Thiết bị bảo đảm an toàn'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 text-center mt-12 text-xs">
                <div>
                  <div className="font-bold uppercase">Người giao / nhận</div>
                  <div className="text-[11px] italic text-slate-500">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="font-bold">{selectedTransactionForPrint.personInCharge}</div>
                </div>

                <div>
                  <div className="font-bold uppercase">Giáo viên phụ trách kho</div>
                  <div className="text-[11px] italic text-slate-500">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16" />
                  <div className="font-bold text-blue-900">Thầy Ngô Quang Vinh</div>
                </div>

                <div>
                  <div className="font-bold uppercase">Ban Giám hiệu duyệt</div>
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
