import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BarChart, Sparkline, ProgressRing } from '../ui/Charts';
import { Activity, Users, CheckCircle, TrendingUp } from 'lucide-react';

export const TeacherClassAnalytics = ({ classId }: { classId: number }) => {
  const [completion, setCompletion] = useState<any[]>([]);
  const [trends, setTrends] = useState<{ Internal: any[]; Ielts: any[] }>({ Internal: [], Ielts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classId) {
      fetchAnalytics();
    }
  }, [classId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [compRes, trendRes] = await Promise.all([
        api.get(`/api/analytics/classes/${classId}/completion`),
        api.get(`/api/analytics/classes/${classId}/trend`)
      ]);
      setCompletion(compRes || null);
      setTrends(Array.isArray(trendRes) ? trendRes : []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu phân tích. Hãy đảm bảo bạn có quyền truy cập lớp này.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Đang tải phân tích lớp học...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-white rounded-xl border border-red-200">{error}</div>;
  }

  // Process completion for BarChart
  const barData = completion.map(t => ({
    label: t.title,
    value: t.completedCount,
    colorClass: t.completedCount === t.totalStudents && t.totalStudents > 0 ? 'bg-green-500' : 'bg-blue-500'
  }));
  const maxStudents = completion.length > 0 ? Math.max(...completion.map(c => c.totalStudents)) : 0;

  // Process overall progress ring (Avg completion rate)
  const totalPossible = completion.reduce((acc, curr) => acc + curr.totalStudents, 0);
  const totalCompleted = completion.reduce((acc, curr) => acc + curr.completedCount, 0);
  const avgProgress = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

  // Process trends
  const internalTrendData = trends.Internal.map(t => t.averageScore);
  const ieltsTrendData = trends.Ielts.map(t => t.averageOverall);

  return (
    <div className="space-y-6 mt-8 border-t border-slate-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Phân tích Lớp học
          </h2>
          <p className="text-slate-500 text-sm mt-1">Tổng quan về tiến độ và kết quả của học sinh.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Completion Donut */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 w-full text-center">Tỷ lệ hoàn thành bài tập</h3>
          <ProgressRing
            radius={60}
            stroke={12}
            progress={avgProgress}
            colorClass={avgProgress >= 80 ? 'text-green-500' : avgProgress >= 50 ? 'text-blue-500' : 'text-orange-500'}
          />
          <p className="text-xs text-slate-500 mt-4 text-center">
            {totalCompleted} / {totalPossible} bài nộp
          </p>
        </div>

        {/* Internal Trend Line */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Xu hướng Bài tập (Internal)
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <Sparkline data={internalTrendData} width={250} height={80} maxVal={10} />
          </div>
          <div className="text-xs text-slate-400 mt-2 text-center">
            Trung bình toàn lớp qua các bài tập gần đây
          </div>
        </div>

        {/* IELTS Trend Line */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Xu hướng IELTS Mock Exam
          </h3>
          <div className="flex-1 flex items-center justify-center">
            {ieltsTrendData.length > 0 ? (
              <Sparkline data={ieltsTrendData} width={250} height={80} maxVal={9.0} />
            ) : (
              <div className="text-slate-400 text-sm">Chưa có dữ liệu Mock Exam.</div>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-2 text-center">
            Điểm Overall trung bình
          </div>
        </div>

      </div>

      {/* Completion Bar Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Phân bố Hoàn thành theo Bài tập
        </h3>
        {barData.length > 0 ? (
          <BarChart data={barData} maxVal={maxStudents} />
        ) : (
          <div className="text-slate-500 text-sm py-4 text-center">Chưa có bài tập nào trong lớp này.</div>
        )}
      </div>

    </div>
  );
};
