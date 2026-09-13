import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const TestSessionPage: React.FC = () => {
  const { publicCode, attemptId } = useParams<{ publicCode: string, attemptId: string }>();
  const navigate = useNavigate();

  const ticket = sessionStorage.getItem(`ielts_ticket_${publicCode}`);

  useEffect(() => {
    if (!ticket) {
      navigate(`/test/${publicCode}`);
    }
  }, [ticket, navigate, publicCode]);

  const participantName = localStorage.getItem('ieltsThanhLe.guestDisplayName') || 'Bạn';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          📝
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">Bài kiểm tra đã sẵn sàng</h1>
        
        <div className="my-6 bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Người làm bài</p>
          <p className="font-bold text-gray-900">{participantName}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Mã lượt làm bài</p>
            <p className="font-mono font-bold text-gray-700">#{attemptId}</p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          (Phase 5: Đã khởi tạo thành công TestAttempt. Giao diện làm bài thực tế sẽ được phát triển ở phase tiếp theo.)
        </p>

        <button 
          onClick={() => navigate('/')} 
          className="text-green-600 font-semibold hover:underline"
        >
          Trở về trang chủ
        </button>
      </div>
    </div>
  );
};
