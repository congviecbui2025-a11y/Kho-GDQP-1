import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAccount, UserRole } from '../../types';
import {
  Users,
  Shield,
  UserCheck,
  UserPlus,
  Lock,
  Edit2,
  Check,
  X,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export const AccountsModule: React.FC = () => {
  const { accounts, currentUser, setCurrentUser, addAccount, updateAccount, showToast } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    role: 'TEACHER' as UserRole,
    roleTitle: 'Giáo viên Bộ môn GDQP&AN',
    email: '',
    phone: '',
    permissions: {
      canManageCatalog: false,
      canCreateTransaction: true,
      canPerformAudit: false,
      canManageCondition: false,
      canViewReports: true,
      canExportReports: false,
      canManageAccounts: false,
      canBackupRestore: false,
    },
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleRoleChange = (role: UserRole) => {
    let roleTitle = 'Giáo viên Bộ môn GDQP&AN';
    let perms = {
      canManageCatalog: false,
      canCreateTransaction: true,
      canPerformAudit: false,
      canManageCondition: false,
      canViewReports: true,
      canExportReports: false,
      canManageAccounts: false,
      canBackupRestore: false,
    };

    if (role === 'ADMIN') {
      roleTitle = 'Giáo viên phụ trách Kho GDQP&AN (Quản trị viên)';
      perms = {
        canManageCatalog: true,
        canCreateTransaction: true,
        canPerformAudit: true,
        canManageCondition: true,
        canViewReports: true,
        canExportReports: true,
        canManageAccounts: true,
        canBackupRestore: true,
      };
    } else if (role === 'PRINCIPAL') {
      roleTitle = 'Ban Giám hiệu (Duyệt báo cáo & Kiểm kê)';
      perms = {
        canManageCatalog: false,
        canCreateTransaction: false,
        canPerformAudit: true,
        canManageCondition: false,
        canViewReports: true,
        canExportReports: true,
        canManageAccounts: false,
        canBackupRestore: false,
      };
    } else if (role === 'CLERK') {
      roleTitle = 'Cán bộ Thiết bị trường học';
      perms = {
        canManageCatalog: true,
        canCreateTransaction: true,
        canPerformAudit: true,
        canManageCondition: true,
        canViewReports: true,
        canExportReports: true,
        canManageAccounts: false,
        canBackupRestore: true,
      };
    }

    setFormData({
      ...formData,
      role,
      roleTitle,
      permissions: perms,
    });
  };

  const handleOpenAdd = () => {
    setFormData({
      username: '',
      fullName: '',
      role: 'TEACHER',
      roleTitle: 'Giáo viên Bộ môn GDQP&AN',
      email: '',
      phone: '',
      permissions: {
        canManageCatalog: false,
        canCreateTransaction: true,
        canPerformAudit: false,
        canManageCondition: false,
        canViewReports: true,
        canExportReports: false,
        canManageAccounts: false,
        canBackupRestore: false,
      },
    });
    setEditingAccount(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (acc: UserAccount) => {
    setEditingAccount(acc);
    setFormData({
      username: acc.username,
      fullName: acc.fullName,
      role: acc.role,
      roleTitle: acc.roleTitle,
      email: acc.email,
      phone: acc.phone,
      permissions: { ...acc.permissions },
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.username.trim()) {
      showToast('Vui lòng điền họ tên và tên đăng nhập', 'error');
      return;
    }

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        fullName: formData.fullName,
        role: formData.role,
        roleTitle: formData.roleTitle,
        email: formData.email,
        phone: formData.phone,
        permissions: formData.permissions,
      });
      setIsAddModalOpen(false);
    } else {
      const res = addAccount({
        username: formData.username.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        role: formData.role,
        roleTitle: formData.roleTitle,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        isActive: true,
        permissions: formData.permissions,
      });
      if (res.success) {
        setIsAddModalOpen(false);
      }
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Mật khẩu mới và xác nhận mật khẩu không khớp!', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
      return;
    }
    showToast('Đã đổi mật khẩu tài khoản thành công!', 'success');
    setIsPasswordModalOpen(false);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1920px] mx-auto font-serif">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Users className="w-6 h-6 text-purple-700" />
            <span>TÀI KHOẢN & PHÂN QUYỀN HỆ THỐNG</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tài khoản giáo viên, phân quyền truy cập, duyệt báo cáo và bảo vệ an ninh thông tin kho quân khí
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            <span>Đổi mật khẩu</span>
          </button>

          {currentUser.permissions.canManageAccounts && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm tài khoản mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Active User Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-cyan-400 flex items-center justify-center text-white font-bold text-lg">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="text-xs text-cyan-300 font-semibold">Tài khoản đang đăng nhập hiện tại:</div>
            <div className="text-base font-bold text-white flex items-center space-x-2">
              <span>{currentUser.fullName}</span>
              <span className="text-xs font-mono text-cyan-200">({currentUser.username})</span>
            </div>
            <div className="text-xs text-slate-200">{currentUser.roleTitle}</div>
          </div>
        </div>

        <div className="text-xs text-right text-slate-300 bg-white/10 p-2.5 rounded-lg border border-white/10">
          <div>Email: {currentUser.email}</div>
          <div>Điện thoại: {currentUser.phone}</div>
          <div>Lần đăng nhập gần nhất: {currentUser.lastLogin}</div>
        </div>
      </div>

      {/* Accounts List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => {
          const isCurrent = acc.id === currentUser.id;

          return (
            <div
              key={acc.id}
              className={`bg-white rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                isCurrent ? 'border-blue-500 ring-2 ring-blue-400/30 bg-blue-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                        acc.role === 'ADMIN'
                          ? 'bg-purple-700'
                          : acc.role === 'PRINCIPAL'
                          ? 'bg-blue-700'
                          : acc.role === 'CLERK'
                          ? 'bg-cyan-700'
                          : 'bg-emerald-700'
                      }`}
                    >
                      {acc.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{acc.fullName}</h3>
                      <div className="font-mono text-[11px] text-slate-500">@{acc.username}</div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Đang dùng
                    </span>
                  )}
                </div>

                <div className="mt-3 text-xs space-y-1 text-slate-600">
                  <div className="font-semibold text-slate-800">{acc.roleTitle}</div>
                  <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                  <div className="text-[11px] text-slate-500">{acc.phone}</div>
                </div>

                {/* Quick permissions tags */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px]">
                  {acc.permissions.canManageCatalog && (
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">QL Danh mục</span>
                  )}
                  {acc.permissions.canCreateTransaction && (
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">Nhập/Xuất kho</span>
                  )}
                  {acc.permissions.canPerformAudit && (
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">Kiểm kê</span>
                  )}
                  {acc.permissions.canManageAccounts && (
                    <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">Admin</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {!isCurrent ? (
                  <button
                    onClick={() => {
                      setCurrentUser(acc);
                      showToast(`Đã chuyển đổi sang tài khoản: ${acc.fullName}`, 'info');
                    }}
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold hover:underline"
                  >
                    Đăng nhập tài khoản này →
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-bold">Phiên làm việc hiện tại</span>
                )}

                {currentUser.permissions.canManageAccounts && (
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                    title="Chỉnh sửa tài khoản"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-purple-900 to-indigo-900 text-white font-bold text-xs">
          MA TRẬN PHÂN QUYỀN TRUY CẬP HỆ THỐNG THEO VAI TRÒ
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                <th className="py-2.5 px-3">Chức năng phân hệ</th>
                <th className="py-2.5 px-3 text-center">Quản trị viên (Thầy Vinh)</th>
                <th className="py-2.5 px-3 text-center">Ban Giám hiệu</th>
                <th className="py-2.5 px-3 text-center">Cán bộ Thiết bị</th>
                <th className="py-2.5 px-3 text-center">Giáo viên Bộ môn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">1. Xem Trang tổng quan & Thống kê số lượng</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Toàn quyền</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Xem đầy đủ</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Xem đầy đủ</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Xem đầy đủ</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">2. Quản lý Danh mục (Thêm, Sửa, Xóa thiết bị)</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-slate-400">Chỉ xem</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-slate-400">Chỉ xem</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">3. Lập phiếu Nhập - Xuất - Điều chỉnh kho</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-slate-400">Duyệt phiếu</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Mượn/Trả</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">4. Thực hiện Kiểm kê & Đối chiếu thực tế</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Thư ký HĐ</td>
                <td className="py-2 px-3 text-center text-blue-700 font-bold">✓ Trưởng ban HĐ</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ủy viên HĐ</td>
                <td className="py-2 px-3 text-center text-slate-400">Không có quyền</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">5. Ghi nhật ký bảo dưỡng & Tình trạng thiết bị</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-slate-400">Chỉ xem</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-slate-400">Báo cáo sự cố</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">6. Báo cáo thống kê & Xuất Excel</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-slate-400">Chỉ xem</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">7. Quản lý Tài khoản & Phân quyền</td>
                <td className="py-2 px-3 text-center text-purple-700 font-bold">✓ Toàn quyền</td>
                <td className="py-2 px-3 text-center text-slate-400">Không</td>
                <td className="py-2 px-3 text-center text-slate-400">Không</td>
                <td className="py-2 px-3 text-center text-slate-400">Không</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">8. Sao lưu & Phục hồi dữ liệu an toàn</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-slate-400">Không</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Cho phép</td>
                <td className="py-2 px-3 text-center text-slate-400">Không</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base font-serif">
                {editingAccount ? 'CẬP NHẬT TÀI KHOẢN' : 'THÊM TÀI KHOẢN MỚI'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-serif">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="VD: Thầy Nguyễn Văn B..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingAccount}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="nguyenvanb"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai trò</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    <option value="TEACHER">Giáo viên Bộ môn</option>
                    <option value="CLERK">Cán bộ Thiết bị</option>
                    <option value="PRINCIPAL">Ban Giám hiệu</option>
                    <option value="ADMIN">Quản trị viên (Toàn quyền)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chức danh / Vị trí công tác</label>
                <input
                  type="text"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@thptbhn.edu.vn"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0918.xxx.xxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-md"
                >
                  {editingAccount ? 'Lưu cập nhật' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-800 text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base font-serif">ĐỔI MẬT KHẨU TÀI KHOẢN</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-4 text-xs font-serif">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md"
                >
                  Xác nhận đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
