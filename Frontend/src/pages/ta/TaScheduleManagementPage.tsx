import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Calendar, Search, CheckCircle, Clock, X } from 'lucide-react';

interface ScheduleRequest {
  id: number;
  studentName: string;
  studentPhone: string;
  className: string;
  skill: string;
  requestType: string;
  reason: string;
  availability: string;
  status: string;
  createdAt: string;
  source: string;
}

export const TaScheduleManagementPage: React.FC = () => {
  const [requests, setRequests] = useState<ScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'PENDING' | 'RESOLVED'>('PENDING');

  const [resolvingReq, setResolvingReq] = useState<ScheduleRequest | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [tab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.get<ScheduleRequest[]>(`/schedule/requests?status=${tab}`);
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCandidates = async (req: ScheduleRequest) => {
    setResolvingReq(req);
    setLoadingCandidates(true);
    try {
      const data = await api.get(`/schedule/search-candidates?skill=${req.skill}`);
      setCandidates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleResolve = async (id: number, targetClassId?: number, targetSessionId?: number) => {
    try {
      await api.post(`/schedule/requests/${id}/resolve`, {
        requestId: id,
        targetClassId,
        targetSessionId,
        status: 'RESOLVED'
      });
      setResolvingReq(null);
      fetchRequests();
    } catch (e) {
      console.error(e);
      alert('Lỗi xử lý yêu cầu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Điều chỉnh lịch học</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và sắp xếp lịch học thay thế cho học viên.</p>
        </div>
        <Button>
          + Tạo yêu cầu
        </Button>
      </div>

      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setTab('PENDING')}
          className={`pb-3 px-2 text-sm font-semibold transition-colors ${tab === 'PENDING' ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Yêu cầu chờ xử lý
        </button>
        <button
          onClick={() => setTab('RESOLVED')}
          className={`pb-3 px-2 text-sm font-semibold transition-colors ${tab === 'RESOLVED' ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Đã xử lý
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Không có yêu cầu nào.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900">{req.studentName}</h3>
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600">{req.className}</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200">{req.skill}</span>
                  {req.source.includes('DIRECT') && (
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded">Ghi nhận trực tiếp</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Loại yêu cầu</span>
                    <p className="font-medium text-gray-900">
                      {req.requestType === 'MAKEUP' ? 'Bận 1 buổi' : 
                       req.requestType === 'TEMPORARY_TRANSFER' ? 'Chuyển tạm thời' : 'Chuyển lâu dài'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Thời gian có thể học</span>
                    <p className="font-medium text-gray-900">{req.availability || 'Chưa cung cấp'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs">Lý do</span>
                    <p className="text-gray-700">{req.reason || 'Không có lý do'}</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:w-48 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 gap-2">
                {tab === 'PENDING' ? (
                  <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => handleSearchCandidates(req)}>
                    <Search className="w-4 h-4 mr-1.5" />
                    Tìm lịch phù hợp
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5 text-green-600 font-semibold justify-center">
                    <CheckCircle className="w-5 h-5" />
                    Đã xử lý
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvingReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900">Tìm lịch phù hợp</h2>
              <button onClick={() => setResolvingReq(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 bg-gray-50 p-4 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2">Học sinh: <span className="text-brand">{resolvingReq.studentName}</span></p>
                <p className="text-sm text-gray-600 mb-1">Kỹ năng: <span className="font-bold">{resolvingReq.skill}</span></p>
                <p className="text-sm text-gray-600">Thời gian có thể học: {resolvingReq.availability}</p>
              </div>

              <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Lịch ứng viên</h3>
              {loadingCandidates ? (
                <div className="text-center py-8 text-gray-500">Đang tìm...</div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có lịch nào phù hợp.</div>
              ) : (
                <div className="space-y-3">
                  {candidates.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-brand transition-colors">
                      <div>
                        <h4 className="font-bold text-gray-900">{c.className}</h4>
                        <p className="text-sm text-gray-500">{c.dayOfWeek} • {c.startTime} - {c.endTime}</p>
                      </div>
                      <Button size="sm" onClick={() => {
                        if (confirm(`Xác nhận chuyển lịch sang ${c.className}?`)) {
                          handleResolve(resolvingReq.id, c.classId);
                        }
                      }}>Chọn</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
