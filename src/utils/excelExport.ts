import * as XLSX from 'xlsx';
import { Equipment, Transaction, AuditRecord, MaintenanceRecord } from '../types';

export function exportEquipmentCatalogToExcel(equipments: Equipment[]) {
  const data = equipments.map((item, index) => ({
    'STT': index + 1,
    'Mã thiết bị': item.code,
    'Tên thiết bị': item.name,
    'Phân loại': item.category,
    'Đơn vị tính': item.unit,
    'Số lượng (Theo sổ)': item.quantityBook,
    'Số lượng (Thực tế)': item.quantityActual,
    'Chênh lệch': item.quantityActual - item.quantityBook,
    'Trạng thái': item.status,
    'Vị trí lưu kho': item.storageLocation,
    'Chất lượng (%)': `${item.conditionPercentage}%`,
    'Tình trạng kỹ thuật': item.conditionDescription,
    'Ngày bảo dưỡng gần nhất': item.lastMaintenanceDate,
    'Nguồn gốc': item.origin,
    'Ghi chú': item.notes,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh mục thiết bị');

  // Trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `DanhMuc_ThietBi_GDQP_THPT_BuiHuuNghia_${dateStr}.xlsx`);
}

export function exportTransactionsToExcel(transactions: Transaction[]) {
  const data = transactions.map((t, index) => ({
    'STT': index + 1,
    'Số phiếu': t.code,
    'Loại phiếu': t.type === 'IN' ? 'Nhập kho' : t.type === 'OUT' ? 'Xuất kho' : 'Điều chỉnh',
    'Ngày lập': t.date,
    'Mã thiết bị': t.equipmentCode,
    'Tên thiết bị': t.equipmentName,
    'Số lượng': t.quantity,
    'Đơn vị tính': t.unit,
    'Người giao/nhận': t.personInCharge,
    'Đơn vị/Lớp': t.departmentOrClass,
    'Mục đích': t.purpose,
    'Chứng từ gốc': t.documentRef || '',
    'Người lập phiếu': t.createdBy,
    'Trạng thái': t.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhật ký Nhập Xuất');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `SoTheoDoi_NhapXuatDieuChinh_${dateStr}.xlsx`);
}

export function exportAuditReportToExcel(audit: AuditRecord) {
  const data = audit.items.map((item, index) => ({
    'STT': index + 1,
    'Mã thiết bị': item.equipmentCode,
    'Tên thiết bị': item.equipmentName,
    'Đơn vị tính': item.unit,
    'Số lượng theo sổ': item.bookQuantity,
    'Số lượng thực tế': item.actualQuantity,
    'Chênh lệch (Thực tế - Sổ)': item.difference,
    'Còn tốt (100%)': item.qualityGood,
    'Cần sửa chữa': item.qualityNeedRepair,
    'Hỏng / Đề xuất thanh lý': item.qualityDamaged,
    'Giải trình nguyên nhân': item.explanation,
    'Trạng thái đối chiếu': item.adjusted ? 'Đã điều chỉnh' : 'Chưa điều chỉnh',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Biên bản kiểm kê');

  const safeCode = audit.code.replace(/[\/\\]/g, '-');
  XLSX.writeFile(workbook, `BienBanKiemKe_${safeCode}.xlsx`);
}

export function exportMaintenanceRecordsToExcel(records: MaintenanceRecord[]) {
  const data = records.map((r, index) => ({
    'STT': index + 1,
    'Mã bảo dưỡng': r.code,
    'Mã thiết bị': r.equipmentCode,
    'Tên thiết bị': r.equipmentName,
    'Ngày bảo dưỡng': r.maintenanceDate,
    'Người thực hiện': r.technician,
    'Hình thức': r.type,
    'Nội dung bảo dưỡng': r.description,
    'Tình trạng trước': r.conditionBefore,
    'Tình trạng sau': r.conditionAfter,
    'Kết quả': r.status,
    'Ngày hẹn kế tiếp': r.nextScheduledDate,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhật ký bảo dưỡng');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `NhatKyBaoDuong_GDQP_${dateStr}.xlsx`);
}
