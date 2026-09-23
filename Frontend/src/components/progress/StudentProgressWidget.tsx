import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader2, CheckCircle2, Circle, Target, ChevronRight, ChevronDown } from 'lucide-react';

interface Milestone {
  id: number;
  name: string;
  isCompleted: boolean;
}

interface Stage {
  id: number;
  name: string;
  isCurrentStage: boolean;
  totalMilestones: number;
  completedMilestones: number;
  milestones: Milestone[];
}

export const StudentProgressWidget = ({ classId }: { classId: string }) => {
  const [skill, setSkill] = useState<'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING'>('WRITING');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [skill]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/progress/student/classes/${classId}/skills/${skill}`);
      setData(res);
    } catch (e) {
      console.error(e);
      setData({ hasStages: false });
    } finally {
      setLoading(false);
    }
  };

  const getSkillColor = (s: string) => {
    switch (s) {
      case 'READING': return 'text-[#1E7A57] bg-[#DDF4EA] border-emerald-200';
      case 'LISTENING': return 'text-[#7C5CC4] bg-[#EEE7FB] border-purple-200';
      case 'WRITING': return 'text-[#3B82C4] bg-[#E6F0FB] border-blue-200';
      case 'SPEAKING': return 'text-[#C96A2E] bg-[#FBEEDC] border-orange-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };
  
  const getSkillFill = (s: string) => {
    switch (s) {
      case 'READING': return '#1E7A57';
      case 'LISTENING': return '#7C5CC4';
      case 'WRITING': return '#3B82C4';
      case 'SPEAKING': return '#C96A2E';
      default: return '#4b5563';
    }
  };

  // Derive current stage from Stages array
  let currentStage: Stage | null = null;
  let currentProgressPercent = 0;
  
  if (data?.hasStages && data.stages) {
    currentStage = data.stages.find((s: Stage) => s.isCurrentStage) || data.stages[data.stages.length - 1];
    if (currentStage && currentStage.totalMilestones > 0) {
      currentProgressPercent = Math.round((currentStage.completedMilestones / currentStage.totalMilestones) * 100);
    }
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 mb-4 flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-black text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Lộ trình hiện tại
        </h2>
        
        {/* Compact Dropdown Selector */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Kỹ năng:</span>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl text-sm font-bold text-gray-700 transition-colors border border-gray-200"
            >
              {skill} <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {['READING', 'LISTENING', 'WRITING', 'SPEAKING'].map(s => (
                <button
                  key={s}
                  onClick={() => { setSkill(s as any); setShowDropdown(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-50 transition-colors ${skill === s ? getSkillColor(s).split(' ')[0] : 'text-gray-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[140px]">
        {loading ? (
          <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : data ? (
          !data.hasStages ? (
            <div className="text-center py-6">
              <p className="text-gray-500 font-medium">
                {data.offeringId 
                  ? "Chưa thiết lập lộ trình cho kỹ năng này."
                  : "Bạn chưa tham gia kỹ năng này."
                }
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              {/* Compact Progress Visual (Donut) */}
              <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                {currentStage && currentStage.totalMilestones > 0 ? (
                  <>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-50"
                        strokeDasharray="100, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3"
                      />
                      <path
                        strokeDasharray={`${currentProgressPercent}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke={getSkillFill(skill)} strokeWidth="3"
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute text-center flex flex-col items-center">
                      <span className="text-lg font-black text-gray-900">{currentProgressPercent}%</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full rounded-full border-4 border-gray-50 flex items-center justify-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  </div>
                )}
              </div>
              
              {/* Progress Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border uppercase ${getSkillColor(skill)}`}>
                    {skill}
                  </span>
                  {data.isHostClass && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                      Học tại {data.className}
                    </span>
                  )}
                </div>
                
                <h3 className="font-black text-lg text-gray-900 leading-tight mb-1">
                  {currentStage?.name || "Đang tải..."}
                </h3>
                
                <p className="text-sm font-medium text-gray-500 mb-4">
                  {!currentStage || currentStage.totalMilestones === 0 ? (
                    "Đang triển khai"
                  ) : (
                    <>${currentStage.completedMilestones} / ${currentStage.totalMilestones} mốc hoàn thành</>
                  )}
                </p>
                
                <button 
                  onClick={() => setShowDetail(true)}
                  className="text-sm font-bold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-1 w-max"
                >
                  Xem lộ trình <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        ) : null}
      </div>

      {/* Detail Modal */}
      {showDetail && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-black text-xl text-gray-900">Chi tiết lộ trình</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getSkillColor(skill)}`}>{skill}</span>
                  {data.isHostClass && <span className="text-xs font-medium text-gray-500">- Học tại {data.className}</span>}
                </div>
              </div>
              <button onClick={() => setShowDetail(false)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors font-bold text-lg">×</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              {data.stages?.map((stage: Stage) => (
                <div key={stage.id} className={stage.isCurrentStage ? '' : 'opacity-60'}>
                  <h4 className={`font-bold text-base mb-4 flex items-center gap-2 ${stage.isCurrentStage ? 'text-gray-900' : 'text-gray-500'}`}>
                    {stage.name}
                    {stage.isCurrentStage && <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">Hiện tại</span>}
                  </h4>
                  <div className="space-y-4 ml-2 border-l-2 border-gray-100 pl-6 py-1 relative">
                    {stage.milestones?.length === 0 && <div className="text-sm text-gray-400 font-medium italic">Chưa có mốc học tập</div>}
                    {stage.milestones?.map((m: Milestone) => (
                      <div key={m.id} className="flex items-start gap-4 relative">
                        {/* Status Marker on the timeline */}
                        <div className="absolute -left-[35px] top-0 bg-white py-1">
                          {m.isCompleted ? (
                            <CheckCircle2 className={`w-6 h-6 ${getSkillColor(skill).split(' ')[0]} bg-white`} />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-200 bg-white" />
                          )}
                        </div>
                        <span className={`text-sm mt-0.5 ${m.isCompleted ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>{m.name}</span>
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
