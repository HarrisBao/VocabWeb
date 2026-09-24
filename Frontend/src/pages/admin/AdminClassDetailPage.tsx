import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Loader2, ChevronLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface SkillOffering {
  id: number;
  skill: string;
  isActive: boolean;
  teacher: { id: string; fullName: string; email: string } | null;
}

interface TeacherInfo {
  id: string;
  fullName: string;
  email: string;
}

const SKILLS = ['READING', 'LISTENING', 'WRITING', 'SPEAKING'];
const SKILL_LABELS: Record<string, string> = {
  READING: 'Đọc hiểu', LISTENING: 'Nghe', WRITING: 'Viết', SPEAKING: 'Nói'
};

export default function AdminClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);

  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');

  const loadOfferings = async () => {
    const data = await api.get<SkillOffering[]>(`/admin/classes/${classId}/skill-offerings`);
    setOfferings(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [, overviewData, teachersData] = await Promise.all([
          loadOfferings(),
          api.get<{ id: number; name: string; code: string }[]>('/admin/overview'),
          api.get<TeacherInfo[]>('/admin/teachers')
        ]);
        const cls = overviewData.find(c => c.id === classId);
        setClassName(cls?.name ?? `Lớp #${classId}`);
        setClassCode(cls?.code ?? '');
        setTeachers(teachersData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classId]);

  const openAssignModal = (skill: string, currentTeacherId?: string) => {
    setActiveSkill(skill);
    setSelectedTeacherId(currentTeacherId || '');
    setIsModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!activeSkill || !selectedTeacherId) return;
    setSaving(true);
    try {
      await api.put(`/admin/classes/${classId}/skill-offerings/${activeSkill}`, {
        teacherId: selectedTeacherId,
        isActive: true,
      });
      await loadOfferings();
      setIsModalOpen(false);
    } catch {
      alert('Lỗi lưu phân công. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearAssignment = async (skill: string) => {
    if (!confirm(`Xóa phân công giáo viên cho ${SKILL_LABELS[skill]}?`)) return;
    try {
      await api.put(`/admin/classes/${classId}/skill-offerings/${skill}`, {
        teacherId: null,
        isActive: true,
      });
      await loadOfferings();
    } catch {
      alert('Lỗi xóa phân công.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 bg-white border border-gray-200 p-2 rounded-lg shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{className}</h1>
            <p className="text-sm text-gray-500 font-mono mt-0.5">{classCode}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* A. THÔNG TIN LỚP */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">A. THÔNG TIN LỚP</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tên lớp</p>
                  <p className="font-medium text-gray-900">{className}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mã lớp</p>
                  <p className="font-medium font-mono text-gray-900">{classCode || 'N/A'}</p>
                </div>
              </div>
            </section>

            {/* B. PHÂN CÔNG GIẢNG DẠY */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">B. PHÂN CÔNG GIẢNG DẠY</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200">
                      <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase">Kỹ năng</th>
                      <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase">Giáo viên</th>
                      <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase">Trạng thái</th>
                      <th className="py-4 px-6 text-sm font-semibold text-gray-500 uppercase text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {SKILLS.map(skill => {
                      const offering = offerings.find(o => o.skill === skill);
                      const hasTeacher = !!offering?.teacher;

                      return (
                        <tr key={skill} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 text-sm font-medium text-gray-900">
                            {SKILL_LABELS[skill]}
                          </td>
                          <td className="py-4 px-6 text-sm">
                            {hasTeacher ? (
                              <div>
                                <span className="font-medium text-gray-900 block">{offering.teacher!.fullName}</span>
                                <span className="text-gray-500 text-xs">{offering.teacher!.email}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Chưa phân công</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-sm">
                            {hasTeacher ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                                Đã phân công
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                Trống
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-sm text-right space-x-3">
                            {hasTeacher ? (
                              <>
                                <button 
                                  onClick={() => openAssignModal(skill, offering.teacher!.id)}
                                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                  Thay đổi
                                </button>
                                <button 
                                  onClick={() => handleClearAssignment(skill)}
                                  className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                >
                                  Gỡ phân công
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => openAssignModal(skill)}
                                className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                              >
                                Phân công
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* TEACHER ASSIGNMENT MODAL */}
      {isModalOpen && activeSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">PHÂN CÔNG GIÁO VIÊN</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Lớp</p>
                <p className="font-medium text-gray-900">{className}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Kỹ năng</p>
                <p className="font-medium text-emerald-600">{SKILL_LABELS[activeSkill]}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Giáo viên</label>
                <select
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">[ Chọn giáo viên ]</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveAssignment}
                disabled={!selectedTeacherId || saving}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu phân công
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
