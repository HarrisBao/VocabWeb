import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Loader2, ChevronLeft, Plus, Trash2, User2 } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface SkillOffering {
  id: number;
  skill: string;
  isActive: boolean;
  teacher: { id: string; fullName: string; email: string } | null;
}

const SKILLS = ['READING', 'LISTENING', 'WRITING', 'SPEAKING'];
const SKILL_LABELS: Record<string, string> = {
  READING: 'Reading', LISTENING: 'Listening', WRITING: 'Writing', SPEAKING: 'Speaking'
};
const SKILL_COLORS: Record<string, string> = {
  READING:   'border-emerald-300 bg-emerald-50',
  LISTENING: 'border-purple-300 bg-purple-50',
  WRITING:   'border-blue-300 bg-blue-50',
  SPEAKING:  'border-orange-300 bg-orange-50',
};
const SKILL_TITLE_COLORS: Record<string, string> = {
  READING:   'text-emerald-700',
  LISTENING: 'text-purple-700',
  WRITING:   'text-blue-700',
  SPEAKING:  'text-orange-700',
};

export default function AdminClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);

  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<Record<string, string>>({});
  const [className, setClassName] = useState('');

  const loadOfferings = async () => {
    const data = await api.get<SkillOffering[]>(`/admin/classes/${classId}/skill-offerings`);
    setOfferings(data);
    const sel: Record<string, string> = {};
    data.forEach(o => { if (o.teacher) sel[o.skill] = o.teacher.id; });
    setSelectedTeachers(sel);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [, overviewData] = await Promise.all([
          loadOfferings(),
          api.get<{ id: number; name: string }[]>('/admin/overview'),
        ]);
        const cls = overviewData.find(c => c.id === classId);
        setClassName(cls?.name ?? `Lớp #${classId}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classId]);

  const handleSave = async (skill: string) => {
    setSaving(skill);
    try {
      await api.put(`/admin/classes/${classId}/skill-offerings/${skill}`, {
        teacherId: selectedTeachers[skill] || null,
        isActive: true,
      });
      await loadOfferings();
    } catch {
      alert('Lỗi lưu phân công. Vui lòng thử lại.');
    } finally {
      setSaving(null);
    }
  };

  const handleClear = async (skill: string) => {
    if (!confirm(`Xóa phân công giáo viên cho ${SKILL_LABELS[skill]}?`)) return;
    setSaving(skill);
    try {
      await api.put(`/admin/classes/${classId}/skill-offerings/${skill}`, {
        teacherId: null,
        isActive: true,
      });
      await loadOfferings();
      setSelectedTeachers(prev => ({ ...prev, [skill]: '' }));
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{className}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Phân công giáo viên theo kỹ năng</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKILLS.map(skill => {
              const offering = offerings.find(o => o.skill === skill);
              const isSaving = saving === skill;

              return (
                <div
                  key={skill}
                  className={`border rounded-xl p-4 ${SKILL_COLORS[skill]}`}
                >
                  <p className={`font-semibold text-sm mb-3 ${SKILL_TITLE_COLORS[skill]}`}>
                    {SKILL_LABELS[skill]}
                  </p>

                  {/* Current teacher */}
                  <div className="flex items-center gap-2 mb-3 min-h-[28px]">
                    {offering?.teacher ? (
                      <>
                        <User2 className="w-4 h-4 text-gray-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {offering.teacher.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{offering.teacher.email}</p>
                        </div>
                        <button
                          onClick={() => handleClear(skill)}
                          disabled={isSaving}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Xóa phân công"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Chưa phân công giáo viên</p>
                    )}
                  </div>

                  {/* Teacher ID input (manual for now — admin enters teacher email/ID) */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Teacher User ID"
                      value={selectedTeachers[skill] ?? ''}
                      onChange={e => setSelectedTeachers(prev => ({ ...prev, [skill]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                    />
                    <button
                      onClick={() => handleSave(skill)}
                      disabled={isSaving || !selectedTeachers[skill]}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {isSaving
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Plus className="w-3.5 h-3.5" />}
                      Lưu phân công
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
