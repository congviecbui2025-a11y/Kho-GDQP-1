import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment, EquipmentStatus } from '../../types';
import { exportEquipmentCatalogToExcel } from '../../utils/excelExport';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  CheckCircle2,
  X,
  Package,
  Layers,
  MapPin,
  Calendar,
  ShieldAlert,
} from 'lucide-react';

export const EquipmentModule: React.FC = () => {
  const { equipments, addEquipment, updateEquipment, deleteEquipment, transactions, showToast, currentUser } =
    useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyDiscrepant, setOnlyDiscrepant] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [viewingItem, setViewingItem] = useState<Equipment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Súng bộ binh',
    unit: 'Khẩu',
    quantityBook: 1,
    quantityActual: 1,
    status: 'Đang bảo quản' as EquipmentStatus,
    storageLocation: 'Tủ vũ khí số 01',
    conditionPercentage: 100,
    conditionDescription: 'Hoạt động tốt, nguyên vẹn',
    lastMaintenanceDate: new Date().toISOString().slice(0, 10),
    origin: 'Cục Quân khí - Bộ Quốc phòng cấp',
    specifications: '',
    notes: '',
  });

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set(equipments.map((e) => e.category));
    return Array.from(set);
  }, [equipments]);

  // Filtered equipments
  const filteredEquipments = useMemo(() => {
    return equipments.filter((item) => {
      const matchSearch =
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchDiscrepancy = !onlyDiscrepant || item.quantityBook !== item.quantityActual;

      return matchSearch && matchStatus && matchCategory && matchDiscrepancy;
    });
  }, [equipments, searchTerm, selectedStatus, selectedCategory, onlyDiscrepant]);

  const handleOpenAddModal = () => {
    // Generate next suggested code
    const nextNum = equipments.length + 1;
    const suggestedCode = `TB-${String(nextNum).padStart(3, '0')}`;

    setFormData({
      code: suggestedCode,
      name: '',
      category: 'Súng bộ binh',
      unit: 'Khẩu',
      quantityBook: 10,
      quantityActual: 10,
      status: 'Đang bảo quản',
      storageLocation: 'Tủ vũ khí số 01 - Giá A1',
      conditionPercentage: 100,
      conditionDescription: 'Thiết bị mới tiếp nhận, đầy đủ phụ kiện',
      lastMaintenanceDate: new Date().toISOString().slice(0, 10),
      origin: 'Sở GD&ĐT TP Cần Thơ cấp',
      specifications: 'Mô hình phục vụ giảng dạy môn GDQP&AN',
      notes: '',
    });
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: Equipment) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantityBook: item.quantityBook,
      quantityActual: item.quantityActual,
      status: item.status,
      storageLocation: item.storageLocation,
      conditionPercentage: item.conditionPercentage,
      conditionDescription: item.conditionDescription,
      lastMaintenanceDate: item.lastMaintenanceDate,
      origin: item.origin,
      specifications: item.specifications,
      notes: item.notes,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên thiết bị', 'error');
      return;
    }

    if (formData.quantityBook < 0 || formData.quantityActual < 0) {
      showToast('Số lượng không thể âm', 'error');
      return;
    }

    if (editingItem) {
      const res = updateEquipment(editingItem.id, {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        quantityBook: Number(formData.quantityBook),
        quantityActual: Number(formData.quantityActual),
        status: formData.status,
        storageLocation: formData.storageLocation,
        conditionPercentage: Number(formData.conditionPercentage),
        conditionDescription: formData.conditionDescription,
        lastMaintenanceDate: formData.lastMaintenanceDate,
        origin: formData.origin,
        specifications: formData.specifications,
        notes: formData.notes,
      });
      if (res.success) {
        setIsAddModalOpen(false);
      } else {
        showToast(res.message, 'error');
      }
    } else {
      const res = addEquipment({
        code: formData.code,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        quantityBook: Number(formData.quantityBook),
        quantityActual: Number(formData.quantityActual),
        status: formData.status,
        storageLocation: formData.storageLocation,
        conditionPercentage: Number(formData.conditionPercentage),
        conditionDescription: formData.conditionDescription,
        lastMaintenanceDate: formData.lastMaintenanceDate,
        origin: formData.origin,
        specifications: formData.specifications,
        notes: formData.notes,
      });
      if (res.success) {
        setIsAddModalOpen(false);
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const handleDelete = (item: Equipment) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thiết bị "${item.name}" (Mã: ${item.code}) khỏi danh mục kho?`)) {
      deleteEquipment(item.id);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1920px] mx-auto font-serif">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Package className="w-6 h-6 text-blue-700" />
            <span>DANH MỤC THIẾT BỊ GIÁO DỤC QUỐC PHÒNG & AN NINH</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý hồ sơ chi tiết, số lượng sổ sách, thực tế, tình trạng kỹ thuật và vị trí lưu trữ trong kho
          </p>
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto flex-wrap">
          <button
            onClick={() => exportEquipmentCatalogToExcel(filteredEquipments)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel ({filteredEquipments.length})</span>
          </button>

          {currentUser.permissions.canManageCatalog && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm thiết bị mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên, vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            >
              <option value="ALL">-- Tất cả trạng thái --</option>
              <option value="Đang bảo quản">Đang bảo quản</option>
              <option value="Cần kiểm tra">Cần kiểm tra</option>
              <option value="Đang sử dụng">Đang sử dụng</option>
              <option value="Hư hỏng">Hư hỏng</option>
              <option value="Chờ thanh lý">Chờ thanh lý</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            >
              <option value="ALL">-- Tất cả phân nhóm --</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle discrepancy only */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full hover:bg-slate-100">
              <input
                type="checkbox"
                checked={onlyDiscrepant}
                onChange={(e) => setOnlyDiscrepant(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-amber-800">Chỉ hiển thị mục có chênh lệch</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-900 text-white font-bold">
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3">Mã TB</th>
                <th className="py-3 px-3">Tên thiết bị</th>
                <th className="py-3 px-3">Phân loại</th>
                <th className="py-3 px-3 text-center">ĐVT</th>
                <th className="py-3 px-3 text-right">Số lượng sổ</th>
                <th className="py-3 px-3 text-right">Số lượng thực</th>
                <th className="py-3 px-3 text-center">Chênh lệch</th>
                <th className="py-3 px-3">Vị trí lưu kho</th>
                <th className="py-3 px-3 text-center">Chất lượng</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEquipments.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500 italic">
                    Không tìm thấy thiết bị nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredEquipments.map((item, index) => {
                  const diff = item.quantityActual - item.quantityBook;
                  const isDiscrepant = diff !== 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/60 transition-colors ${
                        isDiscrepant ? 'bg-amber-50/50' : index % 2 === 1 ? 'bg-slate-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">{index + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-900 whitespace-nowrap">{item.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-700">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">{item.quantityBook}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.quantityActual}</td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {diff === 0 ? (
                          <span className="text-emerald-700 text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            0 (Khớp)
                          </span>
                        ) : diff > 0 ? (
                          <span className="text-blue-700 text-[11px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            +{diff} (Thừa)
                          </span>
                        ) : (
                          <span className="text-red-700 text-[11px] bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            {diff} (Thiếu)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 truncate max-w-xs">{item.storageLocation}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                            item.conditionPercentage >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.conditionPercentage >= 75
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.conditionPercentage}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            item.status === 'Đang bảo quản'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Cần kiểm tra'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'Đang sử dụng'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'Đang bảo quản'
                                ? 'bg-emerald-600'
                                : item.status === 'Cần kiểm tra'
                                ? 'bg-amber-600'
                                : item.status === 'Đang sử dụng'
                                ? 'bg-blue-600'
                                : 'bg-red-600'
                            }`}
                          />
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setViewingItem(item)}
                            title="Xem thẻ kho chi tiết"
                            className="p-1 rounded text-sky-700 hover:bg-sky-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {currentUser.permissions.canManageCatalog && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                title="Chỉnh sửa thông tin"
                                className="p-1 rounded text-blue-700 hover:bg-blue-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                title="Xóa thiết bị"
                                className="p-1 rounded text-red-700 hover:bg-red-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600">
          <div>
            Hiển thị <strong>{filteredEquipments.length}</strong> / <strong>{equipments.length}</strong> loại thiết bị
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-semibold">
            <span>
              Tổng sổ sách:{' '}
              <strong className="text-blue-900">
                {filteredEquipments.reduce((s, i) => s + i.quantityBook, 0)}
              </strong>
            </span>
            <span>
              Tổng thực tế:{' '}
              <strong className="text-cyan-900">
                {filteredEquipments.reduce((s, i) => s + i.quantityActual, 0)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-900 to-sky-800 text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base font-serif">
                {editingItem ? 'CHỈNH SỬA THÔNG TIN THIẾT BỊ' : 'THÊM THIẾT BỊ MỚI VÀO KHO'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mã TB */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã thiết bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>

                {/* Tên TB */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên thiết bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                {/* Phân loại */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại thiết bị</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="VD: Súng bộ binh, Thiết bị mô phỏng..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Đơn vị tính */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn vị tính</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Khẩu">Khẩu</option>
                    <option value="Chiếc">Chiếc</option>
                    <option value="Quả">Quả</option>
                    <option value="Cái">Cái</option>
                    <option value="Bộ">Bộ</option>
                    <option value="Hòm">Hòm</option>
                  </select>
                </div>

                {/* Số lượng theo sổ */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số lượng (theo sổ sách) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantityBook}
                    onChange={(e) => setFormData({ ...formData, quantityBook: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                {/* Số lượng thực tế */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số lượng (thực tế tại kho) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantityActual}
                    onChange={(e) => setFormData({ ...formData, quantityActual: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái quản lý</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Đang bảo quản">Đang bảo quản</option>
                    <option value="Cần kiểm tra">Cần kiểm tra</option>
                    <option value="Đang sử dụng">Đang sử dụng</option>
                    <option value="Hư hỏng">Hư hỏng</option>
                    <option value="Chờ thanh lý">Chờ thanh lý</option>
                  </select>
                </div>

                {/* Vị trí lưu kho */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vị trí lưu kho</label>
                  <input
                    type="text"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Chất lượng % */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tỷ lệ chất lượng sử dụng (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.conditionPercentage}
                    onChange={(e) => setFormData({ ...formData, conditionPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Nguồn gốc */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguồn gốc cấp phát</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tình trạng kỹ thuật */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả tình trạng kỹ thuật</label>
                <input
                  type="text"
                  value={formData.conditionDescription}
                  onChange={(e) => setFormData({ ...formData, conditionDescription: e.target.value })}
                  placeholder="VD: Đầy đủ phụ kiện, đã tra dầu mỡ bảo dưỡng..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quy cách / Ghi chú */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quy cách kỹ thuật & Ghi chú</label>
                <textarea
                  rows={2}
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  placeholder="Thông số, đặc điểm nhận dạng..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-md"
                >
                  {editingItem ? 'Lưu thay đổi' : 'Thêm vào danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Card / Thẻ kho chi tiết Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-900 to-sky-900 text-white px-5 py-3.5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-base font-serif">
                  THẺ KHO THIẾT BỊ: {viewingItem.name} ({viewingItem.code})
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-serif">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Mã quản lý:</span>
                  <strong className="text-sm text-blue-900 font-bold">{viewingItem.code}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Tên thiết bị:</span>
                  <strong className="text-sm text-slate-800">{viewingItem.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Đơn vị tính:</span>
                  <strong className="text-sm text-slate-800">{viewingItem.unit}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Số lượng theo sổ sách:</span>
                  <strong className="text-base text-blue-800">{viewingItem.quantityBook}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Số lượng thực tế tại kho:</span>
                  <strong className="text-base text-cyan-800">{viewingItem.quantityActual}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Chênh lệch kiểm kê:</span>
                  <strong
                    className={`text-base ${
                      viewingItem.quantityActual === viewingItem.quantityBook
                        ? 'text-emerald-700'
                        : 'text-red-600 font-bold'
                    }`}
                  >
                    {viewingItem.quantityActual - viewingItem.quantityBook}
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Vị trí cất giữ: <strong>{viewingItem.storageLocation}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Layers className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span>
                    Nguồn gốc cấp phát: <strong>{viewingItem.origin}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Ngày bảo dưỡng gần nhất: <strong>{viewingItem.lastMaintenanceDate}</strong>
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/70 p-3.5 rounded-lg border border-blue-200">
                <div className="font-bold text-blue-900 mb-1">Tình trạng kỹ thuật:</div>
                <p className="text-slate-700 leading-relaxed">{viewingItem.conditionDescription}</p>
                <div className="mt-2 text-[11px] text-slate-500 italic">
                  Quy cách: {viewingItem.specifications || 'Theo tiêu chuẩn mô hình vũ khí giáo khoa'}
                </div>
              </div>

              {/* Lịch sử phiếu liên quan của thiết bị này */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Lịch sử xuất nhập gần nhất của thiết bị này:</h4>
                {transactions.filter((t) => t.equipmentId === viewingItem.id || t.equipmentCode === viewingItem.code).length === 0 ? (
                  <p className="text-slate-500 italic text-[11px]">Chưa có giao dịch biến động nào.</p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="py-1.5 px-2">Phiếu</th>
                          <th className="py-1.5 px-2">Loại</th>
                          <th className="py-1.5 px-2">Ngày</th>
                          <th className="py-1.5 px-2 text-right">SL</th>
                          <th className="py-1.5 px-2">Đơn vị / Lớp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions
                          .filter((t) => t.equipmentId === viewingItem.id || t.equipmentCode === viewingItem.code)
                          .map((t) => (
                            <tr key={t.id}>
                              <td className="py-1 px-2 font-semibold text-blue-800">{t.code}</td>
                              <td className="py-1 px-2">
                                <span
                                  className={`px-1 rounded text-[10px] font-bold ${
                                    t.type === 'IN'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : t.type === 'OUT'
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {t.type === 'IN' ? 'Nhập' : t.type === 'OUT' ? 'Xuất' : 'Đ/C'}
                                </span>
                              </td>
                              <td className="py-1 px-2 text-slate-500">{t.date}</td>
                              <td className="py-1 px-2 text-right font-bold">{t.quantity}</td>
                              <td className="py-1 px-2 text-slate-700 truncate">{t.departmentOrClass}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900"
                >
                  Đóng thẻ kho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
