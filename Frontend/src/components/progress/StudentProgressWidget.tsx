import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader2, CheckCircle2, Circle, Target, ChevronRight } from 'lucide-react';

interface Stage {
  id: number;
  name: string;
  isCurrentStage: boolean;
  milestones: Milestone[];
}

interface Milestone {
  id: number;
  name: string;
  isCompleted: boolean;
}

export const StudentProgressWidget = ({ classId }: { classId: string }) => {
  const [skill, setSkill] = useState<'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING'>('WRITING');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [skill]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/progress/student/classes/${classId}/skills/${skill}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getSkillColor = (s: string) => {
    switch (s) {
      case 'READING': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'LISTENING': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'WRITING': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'SPEAKING': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };
  
  const getSkillFill = (s: string) => {
    switch (s) {
      case 'READING': return '#059669'; // emerald-600
      case 'LISTENING': return '#7c3aed'; // violet-600
      case 'WRITING': return '#2563eb'; // blue-600
      case 'SPEAKING': return '#ea580c'; // orange-600
      default: return '#4b5563';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Lộ trình hiện tại
        </h2>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['READING', 'LISTENING', 'WRITING', 'SPEAKING'].map(s => (
            <button
              key={s}
              onClick={() => setSkill(s as any)}
              className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                skill === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
      ) : data ? (
        !data.hasStages ? (
          <div className="text-center py-8 text-gray-500 text-sm">Chưa thiết lập lộ trình.</div>
        ) : (
          <div className="flex items-center gap-6">
            {/* Semi Donut */}
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
              {data.totalMilestones > 0 ? (
                <>
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-100"
                      strokeDasharray="100, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3"
                    />
                    <path
                      strokeDasharray={`${data.progressPercent}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke={getSkillFill(skill)} strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center flex flex-col items-center">
                    <span className="text-lg font-bold text-gray-800">{data.progressPercent}%</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-gray-100 flex items-center justify-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSkillColor(skill)}`}>
                  {skill}
                </span>
                {data.isHostClass && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Học tại {data.className}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{data.currentStage?.name}</h3>
              <p className="text-sm text-gray-500 mb-3">
                {data.totalMilestones === 0 ? (
                  "Đang triển khai"
                ) : (
                  <>{data.completedMilestones} / {data.totalMilestones} mốc hoàn thành</>
                )}
              </p>
              
              <button 
                onClick={() => setShowDetail(true)}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Xem chi tiết lộ trình <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      ) : null}

      {/* Detail Modal */}
      {showDetail && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Chi tiết lộ trình</h3>
                <p className="text-sm text-gray-500">{skill} {data.isHostClass && `- Học tại ${data.className}`}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 font-bold p-2">✕</button>
            </div>
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {data.stages?.map((stage: Stage) => (
                <div key={stage.id} className={stage.isCurrentStage ? '' : 'opacity-60'}>
                  <h4 className={`font-bold text-sm mb-3 flex items-center gap-2 ${stage.isCurrentStage ? 'text-gray-900' : 'text-gray-500'}`}>
                    {stage.name}
                    {stage.isCurrentStage && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Hiện tại</span>}
                  </h4>
                  <div className="space-y-3 ml-2 border-l-2 border-gray-100 pl-4 py-1">
                    {stage.milestones?.length === 0 && <div className="text-sm text-gray-400 italic">Chưa có mốc học tập</div>}
                    {stage.milestones?.map(m => (
                      <div key={m.id} className="flex items-start gap-3">
                        {m.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${m.isCompleted ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
