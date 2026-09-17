import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { SKILLS_LIST } from '../../config/skills';
import { Loader2, Calendar, AlertCircle, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ClassDetail {
  id: number;
  name: string;
  code: string;
  description: string;
  vocabularyCount: number;
  readingCount: number;
  writingCount: number;
}

interface ScheduleItem {
  skill: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  className: string;
  isOverride: boolean;
  type?: string;
}

export const StudentClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showReport, setShowReport] = useState(false);
  const [reportSkill, setReportSkill] = useState('SPEAKING');
  const [reportType, setReportType] = useState('MAKEUP');
  const [reason, setReason] = useState('');
  const [availability, setAvailability] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const [clsData, schedData] = await Promise.all([
          api.get<ClassDetail>(`/student/classes/${id}`),
          api.get<ScheduleItem[]>(`/student/classes/${id}/schedule`)
        ]);
        setCls(clsData);
        setSchedule(schedData);
      } catch (e) {
        console.error("Lỗi tải lớp học", e);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/student/schedule-requests', {
        classId: parseInt(id!),
        skill: reportSkill,
        requestType: reportType,
        reason,
        availability
      });
      alert('Yêu cầu đã được gửi!');
      setShowReport(false);
    } catch (e) {
      console.error(e);
      alert('Lỗi khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;
  }

  if (!cls) {
    return <div className="text-center p-12 text-gray-500">Không tìm thấy lớp học.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 relative">
      <div className="bg-gradient-to-br from-brand-dark to-brand p-8 rounded-2xl shadow-md text-white">
        <Link to="/student" className="inline-flex items-center text-brand-light hover:text-white mb-4 text-sm font-medium transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại Lớp học
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">{cls.name}</h1>
            <p className="text-brand-light opacity-90">{cls.description || `Lớp học ${cls.code}`}</p>
          </div>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={() => setShowReport(true)}>
            Báo bận / Đổi lịch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            HỌC KỸ NĂNG
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKILLS_LIST.map(skill => {
              const isActive = skill.status === 'ACTIVE';
              let statText = '';
              
              if (skill.id === 'vocabulary') statText = `${cls.vocabularyCount} bộ từ vựng`;
              if (skill.id === 'reading') statText = `${cls.readingCount} bài Reading`;
              if (skill.id === 'writing') statText = `${cls.writingCount} bài Writing`;
              
              return (
                <Link 
                  key={skill.id}
                  to={isActive ? `/student/classes/${cls.id}/${skill.id}` : '#'}
                  className={`p-6 rounded-2xl border-2 transition-all block relative overflow-hidden group ${
                    isActive 
                      ? 'border-brand-light bg-surface hover:border-brand hover:shadow-md' 
                      : 'border-surface-hover bg-surface-muted hover:bg-gray-50 opacity-80 cursor-default'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl mb-4 ${skill.accentClass}`}>
                    {skill.label.charAt(0)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{skill.label}</h3>
                  <p className="text-sm text-gray-600 mb-4">{skill.description}</p>
                  
                  {isActive ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {statText}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-700 group-hover:text-gray-900 group-hover:translate-x-1 transition-transform">
                        Vào học
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400">
                      Sắp ra mắt
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            Lịch học
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
            {schedule.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có lịch.</p>
            ) : (
              schedule.map((s, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${s.isOverride ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900">{s.skill}</span>
                    {s.isOverride && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Lịch thay thế</span>}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{s.dayOfWeek} • {s.startTime} - {s.endTime}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.className}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900">Báo bận / Xin đổi lịch</h2>
              <button onClick={() => setShowReport(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <form onSubmit={handleReportSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kỹ năng bị ảnh hưởng</label>
                <select value={reportSkill} onChange={e => setReportSkill(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand focus:border-brand">
                  <option value="READING">Reading</option>
                  <option value="LISTENING">Listening</option>
                  <option value="WRITING">Writing</option>
                  <option value="SPEAKING">Speaking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hình thức điều chỉnh</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="reqType" value="MAKEUP" checked={reportType === 'MAKEUP'} onChange={() => setReportType('MAKEUP')} className="text-brand focus:ring-brand" />
                    <span className="text-sm">Tôi chỉ bận một buổi này (Học bù)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="reqType" value="TEMPORARY_TRANSFER" checked={reportType === 'TEMPORARY_TRANSFER'} onChange={() => setReportType('TEMPORARY_TRANSFER')} className="text-brand focus:ring-brand" />
                    <span className="text-sm">Tôi bận lịch này trong một khoảng thời gian</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="reqType" value="PERMANENT_TRANSFER" checked={reportType === 'PERMANENT_TRANSFER'} onChange={() => setReportType('PERMANENT_TRANSFER')} className="text-brand focus:ring-brand" />
                    <span className="text-sm">Tôi muốn đổi lịch lâu dài</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lý do</label>
                <input required type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Vd: Có việc gia đình..." className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-brand focus:border-brand" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Thời gian có thể học bù/thay thế</label>
                <input required type="text" value={availability} onChange={e => setAvailability(e.target.value)} placeholder="Vd: Thứ 4, 18:00 - 21:00" className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-brand focus:border-brand" />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowReport(false)}>Hủy</Button>
                <Button type="submit" loading={submitting}>Gửi yêu cầu</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
