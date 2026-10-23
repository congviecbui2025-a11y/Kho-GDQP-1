import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#051324] border-t border-[#0d2a4a] text-slate-300 text-xs py-2 px-6 flex flex-col sm:flex-row justify-between items-center z-10 font-serif">
      <div className="flex items-center space-x-2">
        <span>© 2025 - Trường THPT Bùi Hữu Nghĩa</span>
        <span className="text-cyan-500">|</span>
        <span className="text-white font-medium">Giáo viên: Ngô Quang Vinh</span>
        <span className="text-cyan-500">|</span>
        <span className="text-cyan-400">Kho Quân khí & Thiết bị GDQP&AN</span>
      </div>
      <div className="mt-1 sm:mt-0 italic font-semibold text-cyan-300 tracking-wider">
        Kỷ luật - Trách nhiệm - Hiệu quả
      </div>
    </footer>
  );
};
