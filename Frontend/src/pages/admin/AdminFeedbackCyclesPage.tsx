import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Loader2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../services/api';

interface FeedbackCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
}

const TYPE_LABELS: Record<string, string> = {
  MONTHLY: 'Hàng tháng',
  MID_STAGE: 'Giữa giai đoạn',
  END_STAGE: 'Cuối giai đoạn',
  CUSTOM: 'Tùy chỉnh',
};

function getAdminToken() {
  return localStorage.getItem('admin_access_token') ?? '';
}

export default function AdminFeedbackCyclesPage() {
  const [cycles, setCycles] = useState<FeedbackCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    type: 'MONTHLY',
  });

  const token = getAdminToken();
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<FeedbackCycle[]>('/admin/feedback-cycles', { headers });
      setCycles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/feedback-cycles', {
        name: form.name,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        type: form.type,
      }, { headers });
      setShowForm(false);
      setForm({ name: '', startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), type: 'MONTHLY' });
      await load();
    } catch {
      alert('Lỗi tạo chu kỳ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cycle: FeedbackCycle) => {
    const newStatus = cycle.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      await api.put(`/admin/feedback-cycles/${cycle.id}/status`, { status: newStatus }, { headers });
      await load();
    } catch {
      alert('Lỗi cập nhật trạng thái.');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chu kỳ Feedback</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý các chu kỳ đánh giá định kỳ</p>
          </div>
          <button
            onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo chu kỳ
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm">Chu kỳ mới</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Tên chu kỳ *</label>
                <input
                  required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Vd: Tháng 9/2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bắt đầu *</label>
                <input
                  type="date" required value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kết thúc *</label>
                <input
                  type="date" required value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Loại</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Hủy
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Tạo chu kỳ
              </button>
            </div>
          </form>
        )}

        {/* Cycle list */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : cycles.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">Chưa có chu kỳ nào.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tên</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Thời gian</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Loại</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cycles.map(cycle => (
                  <tr key={cycle.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{cycle.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {formatDate(cycle.startDate)} – {formatDate(cycle.endDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {TYPE_LABELS[cycle.type] ?? cycle.type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        cycle.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cycle.status === 'ACTIVE'
                          ? <><CheckCircle className="w-3 h-3" /> Đang mở</>
                          : <><XCircle className="w-3 h-3" /> Đã đóng</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(cycle)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
                      >
                        {cycle.status === 'ACTIVE' ? 'Đóng' : 'Mở lại'}
                      </button>
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
