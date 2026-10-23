export type ModuleType =
  | 'dashboard'
  | 'equipment'
  | 'transactions'
  | 'audit'
  | 'condition'
  | 'reports'
  | 'accounts'
  | 'backup';

export type EquipmentStatus =
  | 'Đang bảo quản'
  | 'Cần kiểm tra'
  | 'Đang sử dụng'
  | 'Hư hỏng'
  | 'Chờ thanh lý';

export interface Equipment {
  id: string;
  code: string; // e.g. TB-001
  name: string; // e.g. TL AK
  category: string; // e.g. Súng bộ binh, Thiết bị mô phỏng, Phương tiện huấn luyện
  unit: string; // Khẩu, Chiếc, Quả, Cái, Bộ
  quantityBook: number; // Số lượng theo sổ
  quantityActual: number; // Số lượng thực tế
  status: EquipmentStatus;
  storageLocation: string; // Vị trí kho (e.g. Tủ A-01)
  conditionPercentage: number; // % chất lượng sử dụng
  conditionDescription: string;
  lastMaintenanceDate: string;
  origin: string; // Bộ GD&ĐT cấp / Ban CHQS TP cấp
  specifications: string;
  notes: string;
  updatedAt: string;
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUST';

export interface Transaction {
  id: string;
  code: string; // e.g. "PN-12/2025", "PX-11/2025"
  type: TransactionType;
  date: string; // e.g. "2025-04-28 09:12"
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  quantity: number;
  unit: string;
  personInCharge: string; // Người giao / Người nhận
  departmentOrClass: string; // Đơn vị / Lớp nhận (VD: Lớp 11A1, Kho quân khí QK9)
  purpose: string; // Mục đích
  documentRef?: string; // Số hiệu chứng từ đính kèm
  notes?: string;
  status: 'COMPLETED' | 'CANCELLED';
  createdBy: string;
}

export interface AuditItem {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  unit: string;
  bookQuantity: number;
  actualQuantity: number;
  difference: number; // actual - book
  qualityGood: number;
  qualityNeedRepair: number;
  qualityDamaged: number;
  explanation: string;
  adjusted: boolean;
}

export interface AuditRecord {
  id: string;
  code: string; // e.g. "KK-01/2025"
  name: string; // e.g. "Kiểm kê đợt 1/2025"
  date: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage: number;
  committeeLeader: string; // Trưởng ban: Ban Giám hiệu
  committeeSecretary: string; // Thư ký: Thầy Ngô Quang Vinh
  committeeMembers: string[];
  items: AuditItem[];
  conclusion: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  code: string; // e.g. "BD-01/2025"
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  maintenanceDate: string;
  technician: string;
  type: 'Bảo dưỡng định kỳ' | 'Lau dầu súng' | 'Sửa chữa hỏng hóc' | 'Kiểm tra an toàn' | 'Thay phụ kiện';
  description: string;
  conditionBefore: string;
  conditionAfter: string;
  nextScheduledDate: string;
  cost?: number;
  status: 'Đạt yêu cầu' | 'Cần kiểm tra lại' | 'Không đạt';
}

export type UserRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'CLERK';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  phone: string;
  avatar?: string;
  lastLogin: string;
  isActive: boolean;
  permissions: {
    canManageCatalog: boolean;
    canCreateTransaction: boolean;
    canPerformAudit: boolean;
    canManageCondition: boolean;
    canViewReports: boolean;
    canExportReports: boolean;
    canManageAccounts: boolean;
    canBackupRestore: boolean;
  };
}

export interface ActivityLog {
  id: string;
  time: string; // e.g. "09:12"
  fullDateTime: string;
  title: string;
  subtitle: string;
  type: 'in' | 'out' | 'audit' | 'adjust' | 'login' | 'system';
  user: string;
}

export interface AppStateData {
  appVersion: string;
  dataMode: 'demo' | 'real';
  lastBackupDate?: string;
  equipments: Equipment[];
  transactions: Transaction[];
  audits: AuditRecord[];
  maintenanceRecords: MaintenanceRecord[];
  accounts: UserAccount[];
  activities: ActivityLog[];
}
