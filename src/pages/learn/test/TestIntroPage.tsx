import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { Button } from '../../../components/ui/Button';

interface PublicTestMetadata {
  publicCode: string;
  title: string;
  description?: string;
  requiresAccessCode: boolean;
  startDate?: string;
  deadline?: string;
  maxAttempts?: number;
  totalQuestions: number;
  timeLimitMinutes?: number;
  passScore: number;
}

export const TestIntroPage: React.FC = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const navigate = useNavigate();
  
  const [metadata, setMetadata] = useState<PublicTestMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  
  const ticket = sessionStorage.getItem(`ielts_ticket_${publicCode}`);
  // Extract participant name from local storage or context if needed, 
  // but let's just fetch metadata. The API can't decode the ticket on GET without sending it, 
  // so we'll just show the metadata.
  
  useEffect(() => {
    if (!ticket) {
      navigate(`/test/${publicCode}`);
      return;
    }
    
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const data = await api.get<PublicTestMetadata>(`/learn/tests/${publicCode}`);
        setMetadata(data);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin bài kiểm tra.');
      } finally {
        setLoading(false);
      }
    };
    if (publicCode) fetchMetadata();
  }, [publicCode, ticket, navigate]);

  const handleStart = async () => {
    if (!ticket || !metadata) return;
    
    setStarting(true);
    setError(null);
    
    try {
      const result = await api.post<any>(
        `/learn/tests/${publicCode}/attempts/start`, 
        {},
        { headers: { 'X-Access-Ticket': ticket } }
      );
      
      // Navigate to the test session
      navigate(`/test/${publicCode}/session/${result.attemptId}`);
    } catch (err: any) {
      setError(err.message || 'Không thể bắt đầu làm bài.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi truy cập</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate(`/test/${publicCode}`)} className="text-green-600 font-semibold hover:underline">
            Quay lại cổng truy cập
          </button>
        </div>
      </div>
    );
  }

  const participantName = localStorage.getItem('ieltsThanhLe.guestDisplayName') || 'Bạn';
  const isLoggedIn = !!localStorage.getItem('vocabweb_token'); // basic check

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          <div className="bg-green-600 p-8 text-center text-white">
            <h1 className="text-3xl font-black mb-2">{metadata.title}</h1>
            {metadata.description && (
              <p className="text-green-100">{metadata.description}</p>
            )}
          </div>
          
          <div className="p-8 space-y-8">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Số câu hỏi</p>
                <p className="text-2xl font-bold text-gray-900">{metadata.totalQuestions}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Thời gian</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metadata.timeLimitMinutes ? `${metadata.timeLimitMinutes} phút` : 'Không giới hạn'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Số lượt tối đa</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metadata.maxAttempts ? metadata.maxAttempts : 'Không giới hạn'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Điểm đạt</p>
                <p className="text-2xl font-bold text-gray-900">{metadata.passScore} / 10</p>
              </div>
            </div>

            <div className="border border-green-100 bg-green-50/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Người làm bài</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  <p className="font-bold text-gray-900 text-lg">{participantName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-white border border-green-200 text-green-700 text-xs font-bold uppercase rounded-full">
                  {isLoggedIn ? 'Học sinh' : 'Khách'}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">
                ⚠️ {error}
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                onClick={handleStart} 
                className="w-full h-14 text-lg font-bold shadow-md"
                disabled={starting}
              >
                {starting ? 'Đang tạo bài...' : 'Bắt đầu làm bài'}
              </Button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
