import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Loader2, Calendar, BookOpen, Library, Edit3, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface ClassDetail {
  id: number;
  name: string;
  code: string;
  description: string;
  vocabularyCount: number;
  readingCount: number;
  writingCount: number;
  teacherName?: string;
}

interface ScheduleItem {
  skill: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  className: string;
  isOverride: boolean;
}

interface VocabularyUnit {
  id: number;
  title: string;
  description: string;
  level: string;
  wordCount: number;
  isPinned: boolean;
}

interface ReadingAssignment {
  id: number;
  title: string;
  durationMinutes: number;
  questionCount: number;
  attemptCount: number;
  latestSubmittedAttemptId?: number | null;
  activeAttemptId?: number | null;
}

interface SkillContext {
  skill: string;
  isHosted: boolean;
  homeClassId: number;
  homeClassName: string;
  hostClassId?: number;
  hostClassName?: string;
  assignmentType?: string;
}

export const StudentClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['overview', 'vocabulary', 'reading', 'writing'];
  const activeTab = validTabs.includes(searchParams.get('tab') as string) 
    ? searchParams.get('tab') as 'overview' | 'vocabulary' | 'reading' | 'writing' 
    : 'overview';
  
  const setActiveTab = (tab: 'overview' | 'vocabulary' | 'reading' | 'writing') => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    });
  };
  
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [skillContexts, setSkillContexts] = useState<SkillContext[]>([]);
  const [loading, setLoading] = useState(true);

  const [vocabUnits, setVocabUnits] = useState<VocabularyUnit[]>([]);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [vocabError, setVocabError] = useState(false);

  const [readings, setReadings] = useState<ReadingAssignment[]>([]);
  const [loadingReading, setLoadingReading] = useState(false);
  const [readingError, setReadingError] = useState(false);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const [clsData, schedData, contextData] = await Promise.all([
          api.get<ClassDetail>(`/student/classes/${id}`),
          api.get<ScheduleItem[]>(`/student/classes/${id}/schedule`).catch(() => []),
          api.get<SkillContext[]>(`/student/classes/${id}/skill-context`).catch(() => [])
        ]);
        setCls(clsData);
        setSchedule(schedData);
        setSkillContexts(contextData);
      } catch (e) {
        console.error("Lỗi tải lớp học", e);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'vocabulary' && vocabUnits.length === 0 && !vocabError) {
      setLoadingVocab(true);
      api.get<VocabularyUnit[]>(`/student/classes/${id}/vocabulary`)
        .then(data => setVocabUnits(data))
        .catch(e => {
          console.error("Lỗi tải từ vựng", e);
          setVocabError(true);
        })
        .finally(() => setLoadingVocab(false));
    }
  }, [activeTab, id, vocabUnits.length, vocabError]);

  useEffect(() => {
    if (activeTab === 'reading' && readings.length === 0 && !readingError) {
      setLoadingReading(true);
      api.get<ReadingAssignment[]>(`/student/classes/${id}/reading`)
        .then(data => setReadings(Array.isArray(data) ? data : []))
        .catch(e => {
          console.error("Lỗi tải reading", e);
          setReadingError(true);
        })
        .finally(() => setLoadingReading(false));
    }
  }, [activeTab, id, readings.length, readingError]);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#0F5F4A]" /></div>;
  }

  if (!cls) {
    return <div className="text-center p-12 text-gray-500">Không tìm thấy lớp học.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="mb-4">
        <Link to="/student" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại Lớp học
        </Link>
      </div>

      <div className="bg-[#0F5F4A] p-8 rounded-2xl shadow-sm text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Library className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wider uppercase mb-3 text-emerald-100">
            Không gian lớp học
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{cls.name}</h1>
          <p className="text-emerald-100/90 flex items-center gap-2">
            Mã lớp: {cls.code} {cls.teacherName && `• Giáo viên: ${cls.teacherName}`}
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-[#0F5F4A] text-[#0F5F4A]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'vocabulary'
                ? 'border-[#1D7A61] text-[#1D7A61]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Từ vựng
            {cls.vocabularyCount > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{cls.vocabularyCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reading')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reading'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reading
            {cls.readingCount > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{cls.readingCount}</span>
            )}
            {skillContexts.find(c => c.skill === 'READING')?.isHosted && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded ml-1 font-semibold uppercase">
                {skillContexts.find(c => c.skill === 'READING')?.hostClassName}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('writing')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'writing'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Writing
            {skillContexts.find(c => c.skill === 'WRITING')?.isHosted && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded ml-1 font-semibold uppercase">
                {skillContexts.find(c => c.skill === 'WRITING')?.hostClassName}
              </span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            
            <div 
              onClick={() => setActiveTab('vocabulary')}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#1D7A61] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Library className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#1D7A61] transition-colors uppercase">Từ vựng</h3>
                  <p className="text-sm text-gray-500">{cls.vocabularyCount} bài học • Ôn từ và luyện tập từ vựng</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="group-hover:bg-[#1D7A61] group-hover:text-white group-hover:border-[#1D7A61]">
                Xem từ vựng
              </Button>
            </div>

            <div 
              onClick={() => setActiveTab('reading')}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors uppercase">Reading</h3>
                  <p className="text-sm text-gray-500">{cls.readingCount > 0 ? `${cls.readingCount} bài tập` : 'Chưa có bài tập'} • Luyện kỹ năng Reading</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600">
                Xem Reading
              </Button>
            </div>

            <div 
              onClick={() => setActiveTab('writing')}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase">Writing</h3>
                  <p className="text-sm text-gray-500">Chưa có bài tập</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600">
                Xem Writing
              </Button>
            </div>

          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Lịch học</h3>
              </div>
              <div className="p-4 space-y-3">
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
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vocabulary' && (
        <div className="space-y-4">
          {loadingVocab ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#1D7A61]" /></div>
          ) : vocabError ? (
            <div className="text-center p-12 text-red-500 font-medium">Không thể tải nội dung từ vựng.</div>
          ) : vocabUnits.length === 0 ? (
            <div className="bg-white border border-emerald-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Library className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài từ vựng nào.</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Giáo viên chưa giao từ vựng cho lớp học này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocabUnits.map(u => (
                <div key={u.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-[#1D7A61] hover:shadow-md transition-all flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#1D7A61]/5 rounded-bl-full -z-0"></div>
                  <div className="flex-1 relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{u.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{u.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 font-medium">
                      <span className="text-[#1D7A61]">{u.level}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{u.wordCount} từ</span>
                    </div>
                  </div>
                  <div className="pt-4 mt-2 relative z-10">
                    <Link to={`/learn/vocabulary/${u.id}?classId=${id}`} className="block w-full bg-[#E8F3F0] text-[#0F5F4A] border border-[#C5E1D9] text-center py-2.5 rounded-xl text-sm font-bold hover:bg-[#1D7A61] hover:text-white transition-colors">
                      {u.title.toLowerCase().includes('ôn tập') ? 'Bắt đầu ôn' : 'Ôn từ'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reading' && (
        <div className="space-y-4">
          {loadingReading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : readingError ? (
            <div className="text-center p-12 text-red-500 font-medium">Không thể tải nội dung Reading.</div>
          ) : readings.length === 0 ? (
            <div className="bg-white border border-emerald-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài Reading nào được giao.</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Giáo viên chưa giao bài tập Reading cho lớp học này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readings.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex flex-col">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-2">{r.title}</h3>
                      {r.attemptCount > 0 ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">MỚI</span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mt-4">
                      <div className="flex justify-between">
                        <span>Thời gian:</span>
                        <span className="font-medium">{r.durationMinutes} phút</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Số câu hỏi:</span>
                        <span className="font-medium">{r.questionCount}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-50 pt-2 mt-2">
                        <span>Số lần làm:</span>
                        <span className="font-medium">{r.attemptCount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4">
                    {r.attemptCount > 0 ? (
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-colors bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                          onClick={(e) => {
                            if (r.latestSubmittedAttemptId) {
                                navigate(`/student/classes/${id}/reading/${r.id}/attempts/${r.latestSubmittedAttemptId}/result`);
                            } else {
                                e.preventDefault();
                                alert("Không tìm thấy kết quả lần làm gần nhất. Vui lòng tải lại trang.");
                                console.error("API Contract Inconsistency: attemptCount > 0 but latestSubmittedAttemptId is null");
                            }
                          }}
                        >
                          Xem kết quả
                        </button>
                        <Link 
                          to={`/student/classes/${id}/reading/${r.id}`} 
                          className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-colors bg-brand-50 text-brand-700 hover:bg-brand-100 border-2 border-transparent block"
                        >
                          {r.activeAttemptId ? 'Tiếp tục' : 'Làm lại'}
                        </Link>
                      </div>
                    ) : (
                      <Link 
                        to={`/student/classes/${id}/reading/${r.id}`} 
                        className="block w-full text-center py-2.5 rounded-xl text-sm font-bold transition-colors bg-emerald-500 text-white hover:bg-emerald-600 border-2 border-transparent"
                      >
                        {r.activeAttemptId ? 'Tiếp tục làm bài' : 'Làm bài'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'writing' && (
        <div className="space-y-4">
          <div className="bg-white border border-blue-100 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit3 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài Writing nào được giao cho lớp này.</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Tất cả bài tập Writing sẽ hiển thị tại đây.</p>
          </div>
        </div>
      )}

    </div>
  );
};
