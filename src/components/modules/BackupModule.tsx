import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  FileJson,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const BackupModule: React.FC = () => {
  const {
    equipments,
    transactions,
    audits,
    maintenanceRecords,
    accounts,
    activities,
    dataMode,
    setDataMode,
    exportBackupJson,
    importBackupJson,
    resetToDefaultDemoData,
    clearDataForFreshStart,
    showToast,
    currentUser,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [backupFileInfo, setBackupFileInfo] = useState<{
    fileName: string;
    version?: string;
    date?: string;
    itemCount?: number;
  } | null>(null);

  // Download JSON backup
  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `SaoLuu_KhoGDQP_THPT_BuiHuuNghia_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống tệp sao lưu dữ liệu toàn hệ thống thành công!', 'success');
  };

  // Select file from disk
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.equipments || !Array.isArray(parsed.equipments)) {
          showToast('Tệp không đúng cấu trúc sao lưu của hệ thống!', 'error');
          return;
        }

        setSelectedFileContent(text);
        setBackupFileInfo({
          fileName: file.name,
          version: parsed.appVersion || '2.5.0',
          date: parsed.lastBackupDate || new Date().toISOString(),
          itemCount: parsed.equipments.length,
        });
      } catch {
        showToast('Tệp tin không phải định dạng JSON hợp lệ!', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Perform restore
  const handleConfirmRestore = () => {
    if (!selectedFileContent) return;
    if (confirm('Khôi phục sẽ ghi đè toàn bộ dữ liệu hiện tại bằng dữ liệu từ tệp sao lưu. Bạn có chắc chắn muốn tiếp tục?')) {
      const res = importBackupJson(selectedFileContent);
      if (res.success) {
        setSelectedFileContent(null);
        setBackupFileInfo(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  // Reset to default demo
  const handleResetDemo = () => {
    if (
      confirm(
        'Khôi phục lại dữ liệu mẫu gốc của Trường THPT Bùi Hữu Nghĩa (8 loại thiết bị, 186 số lượng sổ sách, 182 thực tế)?'
      )
    ) {
      resetToDefaultDemoData();
    }
  };

  // Clear data
  const handleClearData = () => {
    const code = prompt('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ danh mục thiết bị và giao dịch để bắt đầu nhập kho thực tế từ đầu. Nhập "XACNHAN" để thực hiện:');
    if (code === 'XACNHAN') {
      clearDataForFreshStart();
    } else if (code !== null) {
      showToast('Mã xác nhận không đúng, hủy thao tác.', 'warning');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1920px] mx-auto font-serif">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Database className="w-6 h-6 text-teal-700" />
            <span>SAO LƯU & PHỤC HỒI DỮ LIỆU KHO AN TOÀN</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu độc lập, lưu trữ trực tiếp trên trình duyệt thiết bị nhà trường, hỗ trợ xuất/nhập snapshot JSON toàn diện
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-600">Chế độ đang chạy:</span>
          <button
            onClick={() => setDataMode(dataMode === 'demo' ? 'real' : 'demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              dataMode === 'demo'
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
            }`}
          >
            {dataMode === 'demo' ? 'Dữ liệu mẫu (Demo THPT Bùi Hữu Nghĩa)' : 'Dữ liệu thực tế của trường'}
          </button>
        </div>
      </div>

      {/* Storage & Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="text-slate-500 font-semibold flex items-center space-x-1.5">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <span>Thiết bị trong kho</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{equipments.length} mục</div>
          <div className="text-[11px] text-slate-400">Tổng 186 theo sổ sách</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="text-slate-500 font-semibold flex items-center space-x-1.5">
            <FileJson className="w-4 h-4 text-cyan-600" />
            <span>Phiếu giao dịch & Kiểm kê</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {transactions.length + audits.length} bản ghi
          </div>
          <div className="text-[11px] text-slate-400">Lưu trữ có đầy đủ lịch sử</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="text-slate-500 font-semibold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Nhật ký bảo dưỡng & tài khoản</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {maintenanceRecords.length + accounts.length} bản ghi
          </div>
          <div className="text-[11px] text-slate-400">Kèm 4 tài khoản phân quyền</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="text-slate-500 font-semibold flex items-center space-x-1.5">
            <Database className="w-4 h-4 text-teal-600" />
            <span>Tình trạng lưu trữ</span>
          </div>
          <div className="text-lg font-bold text-emerald-700 mt-1">An toàn (Cục bộ)</div>
          <div className="text-[11px] text-slate-400">Tự động đồng bộ liên tục</div>
        </div>
      </div>

      {/* Main Operations: Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Sao lưu (Tải về JSON) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-serif">1. SAO LƯU DỮ LIỆU TOÀN DIỆN</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Tạo tệp tin nén JSON chứa toàn bộ dữ liệu kho: danh mục thiết bị, lịch sử các phiếu nhập - xuất - điều
              chỉnh, các biên bản kiểm kê, hồ sơ bảo dưỡng kỹ thuật và ma trận tài khoản người dùng.
            </p>

            <div className="mt-4 bg-teal-50/60 p-3 rounded-lg border border-teal-200 text-xs text-teal-900 space-y-1">
              <div>
                ✓ Định dạng tệp: <strong>.json</strong> (Chuẩn mở, dễ kiểm tra, không sợ hỏng)
              </div>
              <div>
                ✓ An toàn: <strong>Bảo mật 100%</strong> trên máy tính giáo viên phụ trách
              </div>
              <div>
                ✓ Tự động đặt tên tệp kèm theo ngày tháng sao lưu chuẩn hóa
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp sao lưu (.json) về máy tính</span>
          </button>
        </div>

        {/* Box 2: Phục hồi (Tải lên JSON) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-serif">2. PHỤC HỒI DỮ LIỆU TỪ TỆP SAO LƯU</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Khôi phục lại toàn bộ dữ liệu kho quân khí từ một tệp sao lưu JSON đã lưu trước đây. Hệ thống tự động
              kiểm tra tính toàn vẹn của dữ liệu trước khi thực hiện.
            </p>

            <div className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            {backupFileInfo && (
              <div className="mt-3 bg-blue-50/70 p-3 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-1">
                <div>
                  Tệp đã chọn: <strong>{backupFileInfo.fileName}</strong>
                </div>
                <div>
                  Số lượng thiết bị trong bản sao lưu: <strong>{backupFileInfo.itemCount} thiết bị</strong>
                </div>
                <div>
                  Thời điểm tạo: <strong>{backupFileInfo.date}</strong>
                </div>
              </div>
            )}
          </div>

          <button
            disabled={!selectedFileContent}
            onClick={handleConfirmRestore}
            className={`w-full py-3 rounded-lg font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2 ${
              selectedFileContent
                ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Tiến hành phục hồi dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Advanced Database Maintenance Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
          CÁC THAO TÁC QUẢN TRỊ DỮ LIỆU ĐẶC BIỆT
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Action 1: Khôi phục dữ liệu mẫu ban đầu */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 font-bold text-blue-900">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>Khôi phục dữ liệu mẫu ban đầu (THPT Bùi Hữu Nghĩa)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Đưa hệ thống trở về đúng 8 loại thiết bị GDQP&AN ban đầu như hình chụp (TL AK, CKC, B41, RPD, MBT03,
                Lựu đạn, Bao súng, Bao đựng), với tổng số lượng 186 theo sổ và 182 thực tế.
              </p>
            </div>

            <button
              onClick={handleResetDemo}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs self-start"
            >
              Khôi phục dữ liệu mẫu gốc
            </button>
          </div>

          {/* Action 2: Làm sạch để bắt đầu năm học mới */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 font-bold text-red-900">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Làm trống kho để bắt đầu năm học mới</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Xóa toàn bộ các thiết bị demo để giáo viên tự nhập mới từ đầu theo danh mục thực tế của trường. Yêu
                cầu xác nhận mật mã an toàn trước khi thực hiện.
              </p>
            </div>

            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs shadow-xs self-start"
            >
              Làm trống kho thực tế
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
