import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ModuleType,
  Equipment,
  Transaction,
  AuditRecord,
  AuditItem,
  MaintenanceRecord,
  UserAccount,
  ActivityLog,
  EquipmentStatus,
  AppStateData,
} from '../types';
import {
  INITIAL_EQUIPMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_ACCOUNTS,
  INITIAL_ACTIVITIES,
} from '../data/initialData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  currentModule: ModuleType;
  setCurrentModule: (mod: ModuleType) => void;
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  dataMode: 'demo' | 'real';
  setDataMode: (mode: 'demo' | 'real') => void;
  
  // Data
  equipments: Equipment[];
  transactions: Transaction[];
  audits: AuditRecord[];
  maintenanceRecords: MaintenanceRecord[];
  accounts: UserAccount[];
  activities: ActivityLog[];

  // Computed
  totalEquipmentTypes: number;
  totalQuantityBook: number;
  totalQuantityActual: number;
  auditDiscrepancy: number;
  equipmentDiscrepancyCount: number;
  monthlyStats: { inCount: number; outCount: number; adjustCount: number };

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Actions
  addEquipment: (item: Omit<Equipment, 'id' | 'updatedAt'>) => { success: boolean; message: string };
  updateEquipment: (id: string, updates: Partial<Equipment>) => { success: boolean; message: string };
  deleteEquipment: (id: string) => { success: boolean; message: string };

  createTransaction: (t: Omit<Transaction, 'id' | 'status' | 'createdBy'>) => { success: boolean; message: string };
  cancelTransaction: (id: string) => { success: boolean; message: string };

  updateAuditItem: (auditId: string, item: AuditItem) => void;
  autoAdjustAllDiscrepancies: (auditId: string) => { success: boolean; message: string };
  completeAudit: (auditId: string) => void;

  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => { success: boolean; message: string };
  updateEquipmentCondition: (equipmentId: string, status: EquipmentStatus, desc?: string, pct?: number) => void;

  addAccount: (account: Omit<UserAccount, 'id' | 'lastLogin'>) => { success: boolean; message: string };
  updateAccount: (id: string, updates: Partial<UserAccount>) => { success: boolean; message: string };

  exportBackupJson: () => string;
  importBackupJson: (content: string) => { success: boolean; message: string };
  resetToDefaultDemoData: () => void;
  clearDataForFreshStart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'buihuunghia_gdqp_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [dataMode, setDataModeState] = useState<'demo' | 'real'>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}dataMode`);
    return (saved as 'demo' | 'real') || 'demo';
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // State initialization with localStorage fallback
  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}equipments_${dataMode}`);
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions_${dataMode}`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [audits, setAudits] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audits_${dataMode}`);
    return saved ? JSON.parse(saved) : [INITIAL_AUDIT];
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}maintenance_${dataMode}`);
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_RECORDS;
  });

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}accounts`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities_${dataMode}`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    return accounts[0] || INITIAL_ACCOUNTS[0];
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}dataMode`, dataMode);
  }, [dataMode]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}equipments_${dataMode}`, JSON.stringify(equipments));
  }, [equipments, dataMode]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions_${dataMode}`, JSON.stringify(transactions));
  }, [transactions, dataMode]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audits_${dataMode}`, JSON.stringify(audits));
  }, [audits, dataMode]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}maintenance_${dataMode}`, JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords, dataMode]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}accounts`, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}activities_${dataMode}`, JSON.stringify(activities));
  }, [activities, dataMode]);

  const setDataMode = (newMode: 'demo' | 'real') => {
    if (newMode === dataMode) return;
    setDataModeState(newMode);
    // Load or initialize for that mode
    const savedEquip = localStorage.getItem(`${STORAGE_KEY_PREFIX}equipments_${newMode}`);
    if (savedEquip) {
      setEquipments(JSON.parse(savedEquip));
    } else {
      setEquipments(newMode === 'demo' ? INITIAL_EQUIPMENTS : []);
    }
    const savedTrans = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions_${newMode}`);
    if (savedTrans) {
      setTransactions(JSON.parse(savedTrans));
    } else {
      setTransactions(newMode === 'demo' ? INITIAL_TRANSACTIONS : []);
    }
    const savedAudits = localStorage.getItem(`${STORAGE_KEY_PREFIX}audits_${newMode}`);
    if (savedAudits) {
      setAudits(JSON.parse(savedAudits));
    } else {
      setAudits(newMode === 'demo' ? [INITIAL_AUDIT] : []);
    }
    const savedActivities = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities_${newMode}`);
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    } else {
      setActivities(newMode === 'demo' ? INITIAL_ACTIVITIES : []);
    }
    showToast(
      newMode === 'demo'
        ? 'Đã chuyển sang chế độ: Dữ liệu mẫu (Demo)'
        : 'Đã chuyển sang chế độ: Dữ liệu thực tế của trường',
      'info'
    );
  };

  const addActivity = (title: string, subtitle: string, type: ActivityLog['type']) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const fullDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${timeStr}`;
    const newLog: ActivityLog = {
      id: 'act-' + Date.now(),
      time: timeStr,
      fullDateTime: fullDate,
      title,
      subtitle,
      type,
      user: currentUser.fullName,
    };
    setActivities((prev) => [newLog, ...prev.slice(0, 49)]); // keep up to 50
  };

  // Computed values
  const totalEquipmentTypes = equipments.length;
  const totalQuantityBook = useMemo(
    () => equipments.reduce((sum, item) => sum + (Number(item.quantityBook) || 0), 0),
    [equipments]
  );
  const totalQuantityActual = useMemo(
    () => equipments.reduce((sum, item) => sum + (Number(item.quantityActual) || 0), 0),
    [equipments]
  );
  
  // Total discrepancy count (number of items with discrepancies or net diff)
  const auditDiscrepancy = Math.abs(totalQuantityBook - totalQuantityActual);

  const equipmentDiscrepancyCount = useMemo(
    () => equipments.filter((item) => item.quantityBook !== item.quantityActual).length,
    [equipments]
  );

  const monthlyStats = useMemo(() => {
    // Current month transactions (e.g. month 4 or current active)
    let inCount = 0;
    let outCount = 0;
    let adjustCount = 0;

    transactions.forEach((t) => {
      if (t.status === 'COMPLETED') {
        if (t.type === 'IN') inCount += t.quantity;
        else if (t.type === 'OUT') outCount += t.quantity;
        else if (t.type === 'ADJUST') adjustCount += t.quantity;
      }
    });

    return { inCount, outCount, adjustCount };
  }, [transactions]);

  // Actions for Equipments
  const addEquipment = (item: Omit<Equipment, 'id' | 'updatedAt'>) => {
    if (!currentUser.permissions.canManageCatalog) {
      showToast('Bạn không có quyền thêm mới thiết bị vào danh mục.', 'error');
      return { success: false, message: 'Quyền bị từ chối' };
    }
    const trimmedCode = item.code.trim().toUpperCase();
    if (!trimmedCode) {
      return { success: false, message: 'Mã thiết bị không được để trống' };
    }
    if (!item.name.trim()) {
      return { success: false, message: 'Tên thiết bị không được để trống' };
    }
    if (equipments.some((e) => e.code.toUpperCase() === trimmedCode)) {
      return { success: false, message: `Mã thiết bị "${trimmedCode}" đã tồn tại trong kho` };
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEquipment: Equipment = {
      ...item,
      id: 'tb-' + Date.now(),
      code: trimmedCode,
      updatedAt: dateStr,
    };

    setEquipments((prev) => [...prev, newEquipment]);
    addActivity(`Thêm thiết bị mới: ${newEquipment.name}`, `(Mã: ${newEquipment.code})`, 'system');
    showToast(`Đã thêm thiết bị "${newEquipment.name}" thành công!`, 'success');
    return { success: true, message: 'Thành công' };
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    if (!currentUser.permissions.canManageCatalog) {
      showToast('Bạn không có quyền chỉnh sửa thông tin thiết bị.', 'error');
      return { success: false, message: 'Quyền bị từ chối' };
    }
    const target = equipments.find((e) => e.id === id);
    if (!target) {
      return { success: false, message: 'Không tìm thấy thiết bị' };
    }

    if (updates.code && updates.code !== target.code) {
      const codeUpper = updates.code.trim().toUpperCase();
      if (equipments.some((e) => e.id !== id && e.code.toUpperCase() === codeUpper)) {
        return { success: false, message: `Mã thiết bị "${codeUpper}" đã được sử dụng` };
      }
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setEquipments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: dateStr } : e))
    );
    addActivity(`Cập nhật thông tin: ${target.name}`, `(Mã: ${target.code})`, 'system');
    showToast(`Đã cập nhật thông tin thiết bị "${target.name}"!`, 'success');
    return { success: true, message: 'Thành công' };
  };

  const deleteEquipment = (id: string) => {
    if (!currentUser.permissions.canManageCatalog) {
      showToast('Bạn không có quyền xóa thiết bị.', 'error');
      return { success: false, message: 'Quyền bị từ chối' };
    }
    const target = equipments.find((e) => e.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy thiết bị' };

    // Check if equipment has related transactions
    const hasTransactions = transactions.some((t) => t.equipmentId === id || t.equipmentCode === target.code);
    if (hasTransactions) {
      showToast(`Không thể xóa "${target.name}" vì đã có lịch sử phiếu nhập/xuất kho liên quan. Vui lòng chuyển trạng thái sang "Chờ thanh lý".`, 'warning');
      return { success: false, message: 'Có giao dịch liên quan' };
    }

    setEquipments((prev) => prev.filter((e) => e.id !== id));
    addActivity(`Xóa thiết bị: ${target.name}`, `(Mã: ${target.code})`, 'system');
    showToast(`Đã xóa thiết bị "${target.name}" khỏi danh mục.`, 'info');
    return { success: true, message: 'Thành công' };
  };

  // Actions for Transactions
  const createTransaction = (t: Omit<Transaction, 'id' | 'status' | 'createdBy'>) => {
    if (!currentUser.permissions.canCreateTransaction) {
      showToast('Bạn không có quyền tạo phiếu nhập/xuất kho.', 'error');
      return { success: false, message: 'Quyền bị từ chối' };
    }

    const eq = equipments.find((e) => e.id === t.equipmentId || e.code === t.equipmentCode);
    if (!eq) {
      return { success: false, message: 'Không tìm thấy thông tin thiết bị trong kho' };
    }

    if (t.quantity <= 0) {
      return { success: false, message: 'Số lượng giao dịch phải lớn hơn 0' };
    }

    if (t.type === 'OUT' && t.quantity > eq.quantityBook) {
      return {
        success: false,
        message: `Số lượng xuất (${t.quantity}) vượt quá tồn kho sổ sách hiện có (${eq.quantityBook} ${eq.unit})`,
      };
    }

    const newTrans: Transaction = {
      ...t,
      id: 'trans-' + Date.now(),
      equipmentId: eq.id,
      equipmentCode: eq.code,
      equipmentName: eq.name,
      unit: eq.unit,
      status: 'COMPLETED',
      createdBy: currentUser.fullName,
    };

    // Update equipment quantity accordingly
    setEquipments((prev) =>
      prev.map((item) => {
        if (item.id === eq.id) {
          let newBook = item.quantityBook;
          let newActual = item.quantityActual;
          if (t.type === 'IN') {
            newBook += t.quantity;
            newActual += t.quantity;
          } else if (t.type === 'OUT') {
            newBook = Math.max(0, newBook - t.quantity);
            newActual = Math.max(0, newActual - t.quantity);
          } else if (t.type === 'ADJUST') {
            // For adjustment, apply delta or adjust book to actual
            newBook = newActual;
          }
          return {
            ...item,
            quantityBook: newBook,
            quantityActual: newActual,
            status: newBook === newActual ? (item.status === 'Cần kiểm tra' ? 'Đang bảo quản' : item.status) : item.status,
          };
        }
        return item;
      })
    );

    setTransactions((prev) => [newTrans, ...prev]);

    const typeLabel = t.type === 'IN' ? 'Nhập' : t.type === 'OUT' ? 'Xuất' : 'Điều chỉnh';
    addActivity(
      `${typeLabel} ${t.quantity} ${eq.unit} ${eq.name}`,
      `(${t.code})`,
      t.type === 'IN' ? 'in' : t.type === 'OUT' ? 'out' : 'adjust'
    );
    showToast(`Đã lập thành công ${typeLabel} kho (${t.code})!`, 'success');
    return { success: true, message: 'Thành công' };
  };

  const cancelTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy phiếu' };
    if (target.status === 'CANCELLED') return { success: false, message: 'Phiếu đã bị hủy trước đó' };

    const eq = equipments.find((e) => e.id === target.equipmentId || e.code === target.equipmentCode);
    if (eq) {
      setEquipments((prev) =>
        prev.map((item) => {
          if (item.id === eq.id) {
            let newBook = item.quantityBook;
            let newActual = item.quantityActual;
            if (target.type === 'IN') {
              newBook = Math.max(0, newBook - target.quantity);
              newActual = Math.max(0, newActual - target.quantity);
            } else if (target.type === 'OUT') {
              newBook += target.quantity;
              newActual += target.quantity;
            }
            return { ...item, quantityBook: newBook, quantityActual: newActual };
          }
          return item;
        })
      );
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'CANCELLED' } : t))
    );
    addActivity(`Hủy ${target.code}`, `(Hoàn tác tồn kho: ${target.equipmentName})`, 'system');
    showToast(`Đã hủy phiếu ${target.code} và hoàn tác số lượng tồn kho.`, 'info');
    return { success: true, message: 'Thành công' };
  };

  // Actions for Audit
  const updateAuditItem = (auditId: string, updatedItem: AuditItem) => {
    setAudits((prev) =>
      prev.map((a) => {
        if (a.id === auditId) {
          const newItems = a.items.map((i) => (i.equipmentId === updatedItem.equipmentId ? updatedItem : i));
          // Calculate progress percentage
          const filled = newItems.filter((i) => i.actualQuantity !== undefined && i.actualQuantity >= 0).length;
          const progress = Math.round((filled / newItems.length) * 100);
          return { ...a, items: newItems, progressPercentage: progress };
        }
        return a;
      })
    );

    // Also sync the actual quantity to the equipment in real-time
    setEquipments((prev) =>
      prev.map((eq) => {
        if (eq.id === updatedItem.equipmentId) {
          const diff = updatedItem.actualQuantity - eq.quantityBook;
          return {
            ...eq,
            quantityActual: updatedItem.actualQuantity,
            status: diff !== 0 ? 'Cần kiểm tra' : eq.status,
          };
        }
        return eq;
      })
    );
  };

  const autoAdjustAllDiscrepancies = (auditId: string) => {
    const audit = audits.find((a) => a.id === auditId);
    if (!audit) return { success: false, message: 'Không tìm thấy đợt kiểm kê' };

    let adjustedCount = 0;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // For every item with discrepancy, create an adjustment transaction and sync quantityBook = quantityActual
    const newTransactions: Transaction[] = [];

    const updatedItems = audit.items.map((item) => {
      if (item.difference !== 0 && !item.adjusted) {
        adjustedCount++;
        const newTrans: Transaction = {
          id: 'trans-adj-' + Date.now() + Math.random().toString().slice(2, 5),
          code: `Phiếu điều chỉnh số ${adjustedCount + 10}/${now.getFullYear()}`,
          type: 'ADJUST',
          date: dateStr,
          equipmentId: item.equipmentId,
          equipmentCode: item.equipmentCode,
          equipmentName: item.equipmentName,
          quantity: Math.abs(item.difference),
          unit: item.unit,
          personInCharge: currentUser.fullName,
          departmentOrClass: 'Hội đồng kiểm kê kho trường',
          purpose: `Điều chỉnh sổ sách theo số lượng thực tế kiểm kê (${item.explanation || 'Kiểm kê định kỳ'})`,
          documentRef: audit.code,
          notes: `Chênh lệch trước điều chỉnh: ${item.difference > 0 ? '+' : ''}${item.difference} ${item.unit}`,
          status: 'COMPLETED',
          createdBy: currentUser.fullName,
        };
        newTransactions.push(newTrans);
        return { ...item, adjusted: true, bookQuantity: item.actualQuantity, difference: 0 };
      }
      return item;
    });

    if (adjustedCount === 0) {
      showToast('Tất cả thiết bị đều đã khớp số liệu hoặc đã được điều chỉnh trước đó.', 'info');
      return { success: true, message: 'Không có chênh lệch cần xử lý' };
    }

    // Sync equipments
    setEquipments((prev) =>
      prev.map((eq) => {
        const matchingItem = audit.items.find((i) => i.equipmentId === eq.id);
        if (matchingItem && matchingItem.difference !== 0) {
          return {
            ...eq,
            quantityBook: matchingItem.actualQuantity,
            quantityActual: matchingItem.actualQuantity,
            status: eq.status === 'Cần kiểm tra' ? 'Đang bảo quản' : eq.status,
          };
        }
        return eq;
      })
    );

    setTransactions((prev) => [...newTransactions, ...prev]);

    setAudits((prev) =>
      prev.map((a) => (a.id === auditId ? { ...a, items: updatedItems, status: 'COMPLETED', progressPercentage: 100 } : a))
    );

    addActivity(
      `Đồng bộ & điều chỉnh ${adjustedCount} thiết bị`,
      `(Theo ${audit.code})`,
      'adjust'
    );

    showToast(`Đã tự động tạo ${adjustedCount} phiếu điều chỉnh và cân bằng sổ sách kho thành công!`, 'success');
    return { success: true, message: 'Đã điều chỉnh thành công' };
  };

  const completeAudit = (auditId: string) => {
    setAudits((prev) =>
      prev.map((a) => (a.id === auditId ? { ...a, status: 'COMPLETED', progressPercentage: 100 } : a))
    );
    showToast('Đã hoàn tất đợt kiểm kê và lưu biên bản chính thức!', 'success');
  };

  // Condition & Maintenance
  const addMaintenanceRecord = (rec: Omit<MaintenanceRecord, 'id'>) => {
    const newRec: MaintenanceRecord = {
      ...rec,
      id: 'bd-' + Date.now(),
    };
    setMaintenanceRecords((prev) => [newRec, ...prev]);

    // Update equipment maintenance date
    setEquipments((prev) =>
      prev.map((e) =>
        e.id === rec.equipmentId
          ? {
              ...e,
              lastMaintenanceDate: rec.maintenanceDate,
              conditionDescription: rec.conditionAfter,
              status: rec.status === 'Không đạt' ? 'Hư hỏng' : rec.status === 'Cần kiểm tra lại' ? 'Cần kiểm tra' : 'Đang bảo quản',
            }
          : e
      )
    );

    addActivity(`Bảo dưỡng: ${rec.equipmentName}`, `(${rec.type})`, 'system');
    showToast(`Đã ghi nhận phiếu bảo dưỡng cho "${rec.equipmentName}"!`, 'success');
    return { success: true, message: 'Thành công' };
  };

  const updateEquipmentCondition = (
    equipmentId: string,
    status: EquipmentStatus,
    desc?: string,
    pct?: number
  ) => {
    setEquipments((prev) =>
      prev.map((e) =>
        e.id === equipmentId
          ? {
              ...e,
              status,
              conditionDescription: desc !== undefined ? desc : e.conditionDescription,
              conditionPercentage: pct !== undefined ? pct : e.conditionPercentage,
            }
          : e
      )
    );
    showToast('Đã cập nhật tình trạng kỹ thuật thiết bị!', 'success');
  };

  // Accounts
  const addAccount = (acc: Omit<UserAccount, 'id' | 'lastLogin'>) => {
    if (!currentUser.permissions.canManageAccounts) {
      showToast('Bạn không có quyền quản lý tài khoản.', 'error');
      return { success: false, message: 'Quyền bị từ chối' };
    }
    const newAcc: UserAccount = {
      ...acc,
      id: 'usr-' + Date.now(),
      lastLogin: 'Chưa đăng nhập',
    };
    setAccounts((prev) => [...prev, newAcc]);
    showToast(`Đã thêm tài khoản "${newAcc.fullName}"!`, 'success');
    return { success: true, message: 'Thành công' };
  };

  const updateAccount = (id: string, updates: Partial<UserAccount>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    showToast('Đã cập nhật thông tin tài khoản thành công!', 'success');
    return { success: true, message: 'Thành công' };
  };

  // Backup & Restore
  const exportBackupJson = () => {
    const backupData: AppStateData = {
      appVersion: '2.5.0',
      dataMode,
      lastBackupDate: new Date().toISOString(),
      equipments,
      transactions,
      audits,
      maintenanceRecords,
      accounts,
      activities,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importBackupJson = (content: string) => {
    try {
      const parsed: AppStateData = JSON.parse(content);
      if (!parsed.equipments || !Array.isArray(parsed.equipments)) {
        return { success: false, message: 'Tệp sao lưu không đúng định dạng: thiếu danh mục thiết bị.' };
      }
      setEquipments(parsed.equipments);
      if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (Array.isArray(parsed.audits)) setAudits(parsed.audits);
      if (Array.isArray(parsed.maintenanceRecords)) setMaintenanceRecords(parsed.maintenanceRecords);
      if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
      if (Array.isArray(parsed.activities)) setActivities(parsed.activities);
      if (parsed.dataMode) setDataModeState(parsed.dataMode);

      addActivity('Khôi phục dữ liệu từ tệp sao lưu', `(Bản sao lưu: ${parsed.appVersion || 'Hệ thống'})`, 'system');
      showToast('Khôi phục toàn bộ dữ liệu thành công!', 'success');
      return { success: true, message: 'Khôi phục thành công' };
    } catch {
      return { success: false, message: 'Tệp tin JSON bị lỗi hoặc không thể đọc được.' };
    }
  };

  const resetToDefaultDemoData = () => {
    setEquipments(INITIAL_EQUIPMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAudits([INITIAL_AUDIT]);
    setMaintenanceRecords(INITIAL_MAINTENANCE_RECORDS);
    setActivities(INITIAL_ACTIVITIES);
    setDataModeState('demo');
    showToast('Đã khôi phục dữ liệu demo mẫu ban đầu của Trường THPT Bùi Hữu Nghĩa!', 'info');
  };

  const clearDataForFreshStart = () => {
    setEquipments([]);
    setTransactions([]);
    setAudits([]);
    setMaintenanceRecords([]);
    setActivities([]);
    setDataModeState('real');
    showToast('Đã làm trống dữ liệu để bắt đầu nhập kho thực tế!', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        currentModule,
        setCurrentModule,
        currentUser,
        setCurrentUser,
        dataMode,
        setDataMode,
        equipments,
        transactions,
        audits,
        maintenanceRecords,
        accounts,
        activities,
        totalEquipmentTypes,
        totalQuantityBook,
        totalQuantityActual,
        auditDiscrepancy,
        equipmentDiscrepancyCount,
        monthlyStats,
        toasts,
        showToast,
        removeToast,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        createTransaction,
        cancelTransaction,
        updateAuditItem,
        autoAdjustAllDiscrepancies,
        completeAudit,
        addMaintenanceRecord,
        updateEquipmentCondition,
        addAccount,
        updateAccount,
        exportBackupJson,
        importBackupJson,
        resetToDefaultDemoData,
        clearDataForFreshStart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
