import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
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

export const TestAccessPage: React.FC = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [metadata, setMetadata] = useState<PublicTestMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [guestName, setGuestName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  useEffect(() => {
    // Load metadata
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const data = await api.get<PublicTestMetadata>(`/learn/tests/${publicCode}`);
        setMetadata(data);
        
        // Check local storage for guest
        if (!isAuthenticated) {
          const storedName = localStorage.getItem('ieltsThanhLe.guestDisplayName');
          if (storedName) setGuestName(storedName);
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin bài kiểm tra.');
      } finally {
        setLoading(false);
      }
    };
    if (publicCode) fetchMetadata();
  }, [publicCode, isAuthenticated]);
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadata) return;
    
    if (!isAuthenticated && !guestName.trim()) {
      setError('Vui lòng nhập tên của bạn.');
      return;
    }
    if (metadata.requiresAccessCode && !accessCode.trim()) {
      setError('Vui lòng nhập mã vào bài.');
      return;
    }
    
    setError(null);
    setVerifying(true);
    
    try {
      let sessionId = localStorage.getItem('ieltsThanhLe.guestSessionId');
      if (!isAuthenticated && !sessionId) {
        sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('ieltsThanhLe.guestSessionId', sessionId);
      }
      
      const payload = {
        guestDisplayName: isAuthenticated ? undefined : guestName.trim(),
        guestSessionId: isAuthenticated ? undefined : sessionId,
        accessCode: metadata.requiresAccessCode ? accessCode.trim() : undefined
      };
      
      const result = await api.post<any>(`/learn/tests/${publicCode}/access`, payload);
      
      if (result.accessGranted) {
        if (!isAuthenticated) {
          localStorage.setItem('ieltsThanhLe.guestDisplayName', guestName.trim());
        }
        
        // Save access ticket in session storage (short lived)
        sessionStorage.setItem(`ielts_ticket_${publicCode}`, result.accessTicket);
        
        navigate(`/test/${publicCode}/intro`);
      }
    } catch (err: any) {
      setError(err.message || 'Mã vào bài chưa đúng.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !metadata) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi truy cập</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="text-green-600 font-semibold hover:underline">
            Trở về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">{metadata?.title}</h1>
          {metadata?.description && (
            <p className="text-gray-600 text-sm">{metadata.description}</p>
          )}
        </div>
        
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <form onSubmit={handleVerify} className="space-y-6">
            
            <div className="border border-gray-100 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">👤</span>
                <h3 className="font-bold text-gray-800">Thông tin người làm bài</h3>
              </div>
              
              {isAuthenticated ? (
                <div>
                  <p className="font-semibold text-gray-900">{user?.fullName || 'Học sinh'}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Tài khoản học sinh</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên của bạn
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow outline-none"
                    maxLength={80}
                    required
                  />
                </div>
              )}
            </div>

            {metadata?.requiresAccessCode && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mã vào bài
                </label>
                <div className="relative">
                  <input
                    type={showAccessCode ? "text" : "password"}
                    value={accessCode}
                    onChange={e => setAccessCode(e.target.value)}
                    placeholder="Nhập mã giáo viên đã cung cấp"
                    className="w-full px-4 py-2.5 pr-12 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessCode(!showAccessCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    aria-label={showAccessCode ? "Ẩn mã" : "Hiện mã"}
                  >
                    {showAccessCode ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base shadow-sm"
              disabled={verifying}
            >
              {verifying ? 'Đang xác thực...' : 'Vào bài'}
            </Button>
            
          </form>
        </div>
        
      </div>
    </div>
  );
};
