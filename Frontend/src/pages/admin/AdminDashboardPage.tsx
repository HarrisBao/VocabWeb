import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Building2, Users, BookOpen, Loader2, ChevronRight } from 'lucide-react';
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
  READING: 'Reading', LISTENING: 'Listening', WRITING: 'Writing', SPEAKING: 'Speaking'
};

export default function AdminDashboardPage() {
  const [classes, setClasses] = useState<ClassOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<ClassOverview[]>('/admin/overview')
      .then(setClasses)
      .catch(() => setError('Không thể tải dữ liệu.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý lớp học và phân công kỹ năng</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((s, c) => s + c.enrollmentCount, 0)}
              </p>
              <p className="text-xs text-gray-500">Tổng học sinh</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((s, c) => s + c.skillOfferings.length, 0)}
              </p>
              <p className="text-xs text-gray-500">Phân công kỹ năng</p>
            </div>
          </div>
        </div>

        {/* Classes table */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Lớp</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Học sinh</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Phân công kỹ năng</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classes.map(cls => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{cls.name}</p>
                      <p className="text-xs text-gray-400">{cls.code}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{cls.enrollmentCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {cls.skillOfferings.length === 0 ? (
                          <span className="text-xs text-gray-400">Chưa phân công</span>
                        ) : cls.skillOfferings.map(o => (
                          <span
                            key={o.skill}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SKILL_COLORS[o.skill] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {SKILL_LABELS[o.skill] ?? o.skill}
                            <span className="opacity-70">· {o.teacherName}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/classes/${cls.id}`}
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-medium"
                      >
                        Quản lý <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
