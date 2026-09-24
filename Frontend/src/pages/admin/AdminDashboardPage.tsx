import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Building2, Users, BookOpen, Loader2, ChevronRight, Plus, X } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface SkillOffering {
  skill: string;
  teacherName: string;
}

interface ClassOverview {
  id: number;
  name: string;
  code: string;
  enrollmentCount: number;
  skillOfferings: SkillOffering[];
}

const SKILL_COLORS: Record<string, string> = {
  READING:   'bg-emerald-100 text-emerald-700',
  LISTENING: 'bg-purple-100 text-purple-700',
  WRITING:   'bg-blue-100 text-blue-700',
  SPEAKING:  'bg-orange-100 text-orange-700',
};

const SKILL_LABELS: Record<string, string> = {
  READING: 'Đọc hiểu', LISTENING: 'Nghe', WRITING: 'Viết', SPEAKING: 'Nói'
};

export default function AdminDashboardPage() {
  const [classes, setClasses] = useState<ClassOverview[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [creating, setCreating] = useState(false);

  const loadClasses = () => {
    setLoading(true);
    api.get<ClassOverview[]>('/admin/overview')
      .then(data => setClasses(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const totalStudents = classes.reduce((sum, c) => sum + c.enrollmentCount, 0);

  const handleCreate = async () => {
    if (!newClassName.trim()) return;
    setCreating(true);
    try {
      await api.post('/admin/classes', { name: newClassName.trim(), code: newClassCode.trim() || undefined });
      setIsModalOpen(false);
      setNewClassName('');
      setNewClassCode('');
      loadClasses();
    } catch (e) {
      alert('Lỗi tạo lớp học.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tổng quan hệ thống</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý lớp học và phân công kỹ năng</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo lớp
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              <p className="text-xs text-gray-500">Lớp học đang hoạt động</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-xs text-gray-500">Học sinh đang theo học</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((sum, c) => sum + c.skillOfferings.length, 0)}
              </p>
              <p className="text-xs text-gray-500">Kỹ năng được phân công</p>
            </div>
          </div>
        </div>

        {/* Class List */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Danh sách lớp học</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">Chưa có lớp học nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <div key={cls.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 transition-colors group flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{cls.code}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                    {cls.enrollmentCount} HS
                  </span>
                </div>

                <div className="flex-1">
                  {cls.skillOfferings.length > 0 ? (
                    <div className="space-y-1.5">
                      {cls.skillOfferings.map(off => (
                        <div key={off.skill} className="flex items-center justify-between text-xs">
                          <span className={\`px-1.5 py-0.5 rounded font-medium \${SKILL_COLORS[off.skill]}\`}>
                            {SKILL_LABELS[off.skill] || off.skill}
                          </span>
                          <span className="text-gray-600 truncate ml-2 text-right">
                            {off.teacherName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa phân công giáo viên</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Link
                    to={\`/admin/classes/\${cls.id}\`}
                    className="flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Quản lý lớp <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Tạo lớp học mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="VD: IELTS Intensive K10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã lớp (Tùy chọn)</label>
                <input 
                  type="text" 
                  value={newClassCode}
                  onChange={e => setNewClassCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Để trống sẽ tự tạo tự động"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!newClassName.trim() || creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tạo lớp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
