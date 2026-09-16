import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BarChart, Sparkline } from '../../components/ui/Charts';
import { BookOpen, AlertCircle, FileText, CheckCircle, Edit3, Headphones, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const StudentClassesHubPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [actionableTests, setActionableTests] = useState<any[]>([]);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [writingFeedback, setWritingFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clsRes, testRes, resRes, fbRes] = await Promise.all([
        api.get('/api/studenthub/classes'),
        api.get('/api/studenthub/tests/actionable'),
        api.get('/api/studenthub/results/recent'),
        api.get('/api/studenthub/feedback/writing')
      ]);
      setClasses(clsRes.data);
      setActionableTests(testRes.data);
      setRecentResults(resRes.data);
      setWritingFeedback(fbRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải trung tâm học tập...</div>;
  }

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'READING': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'LISTENING': return <Headphones className="w-5 h-5 text-purple-500" />;
      case 'WRITING': return <Edit3 className="w-5 h-5 text-red-500" />;
      case 'SPEAKING': return <MessageCircle className="w-5 h-5 text-green-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'READING': return 'bg-blue-100 text-blue-700';
      case 'LISTENING': return 'bg-purple-100 text-purple-700';
      case 'WRITING': return 'bg-red-100 text-red-700';
      case 'SPEAKING': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Trung tâm học tập IELTS</h1>
        <p className="text-blue-100 mb-6">Theo dõi tiến độ, hoàn thành bài tập và xem nhận xét từ giáo viên của bạn.</p>
        
        <div className="flex gap-4">
          <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            <span className="block text-2xl font-bold">{classes.length}</span>
            <span className="text-xs text-blue-100 uppercase tracking-wider">Lớp học</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            <span className="block text-2xl font-bold">{actionableTests.length}</span>
            <span className="text-xs text-blue-100 uppercase tracking-wider">Bài tập cần làm</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            <span className="block text-2xl font-bold">{writingFeedback.length}</span>
            <span className="text-xs text-blue-100 uppercase tracking-wider">Nhận xét Writing</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Classes & Tests */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Lớp học của tôi
            </h2>
            {classes.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-500">
                Bạn chưa tham gia lớp học nào.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map(c => (
                  <Link key={c.id} to={`/class/${c.code}/portal`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getSkillColor(c.skill)}`}>
                          {c.skill}
                        </span>
                        {getSkillIcon(c.skill)}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{c.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">Giáo viên: {c.teacherName}</p>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-600 border-t border-slate-100 pt-3">
                      {c.actionableTestsCount > 0 && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="w-4 h-4" /> {c.actionableTestsCount} bài tập mới
                        </span>
                      )}
                      {c.newFeedbackCount > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" /> {c.newFeedbackCount} nhận xét
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Bài tập cần hoàn thành
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {actionableTests.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Bạn không có bài tập nào cần làm lúc này.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {actionableTests.map(t => {
                    const statusText = new Date(t.deadline) < new Date() ? 'HẾT HẠN' : 'ĐANG MỞ';
                    const statusColor = statusText === 'HẾT HẠN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';

                    return (
                      <li key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                              {statusText}
                            </span>
                            <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-full">
                              {t.className}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-800">{t.title}</h4>
                          {t.deadline && (
                            <p className="text-xs text-slate-500 mt-1">Hạn chót: {new Date(t.deadline).toLocaleDateString()}</p>
                          )}
                        </div>
                        <Button size="sm" variant={statusText === 'HẾT HẠN' ? 'outline' : 'primary'} disabled={statusText === 'HẾT HẠN'}>
                          Làm bài
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Results & Feedback */}
        <div className="space-y-8">
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Kết quả gần đây
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              {recentResults.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">Chưa có dữ liệu kết quả.</div>
              ) : (
                <div className="space-y-4">
                  {recentResults.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-medium text-sm text-slate-800 truncate w-40" title={r.testTitle}>{r.testTitle}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{new Date(r.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        {r.type === 'IELTS_MOCK' ? (
                          <span className="inline-block bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-sm">
                            Band {r.overall?.toFixed(1) || '?'}
                          </span>
                        ) : (
                          <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded text-sm">
                            {r.score} / {r.scale === 'IELTS_BAND' ? '9.0' : (r.maxScore || '10')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Xu hướng điểm số (Mới nhất)</h5>
                    <Sparkline 
                      data={recentResults.filter(r => r.type === 'INTERNAL').map(r => r.score).reverse()} 
                      width={280} 
                      height={60} 
                      maxVal={10} 
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-red-500" />
              Nhận xét Writing
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {writingFeedback.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Chưa có feedback Writing.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {writingFeedback.map(fb => (
                    <li key={fb.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 text-sm">{fb.taskName}</h4>
                        <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-xs">Band {fb.overallBand || '?'}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 italic">"{fb.teacherComment}"</p>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                        <div>TR: <span className="font-semibold text-slate-700">{fb.taskResponse || '?'}</span></div>
                        <div>CC: <span className="font-semibold text-slate-700">{fb.coherenceCohesion || '?'}</span></div>
                        <div>LR: <span className="font-semibold text-slate-700">{fb.lexicalResource || '?'}</span></div>
                        <div>GR: <span className="font-semibold text-slate-700">{fb.grammaticalRange || '?'}</span></div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
