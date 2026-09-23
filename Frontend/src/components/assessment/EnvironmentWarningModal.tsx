import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AssessmentMode } from './useAssessmentEnvironmentCheck';
import { DetectionResult } from './detectBrowserInterference';

interface EnvironmentWarningModalProps {
  mode: AssessmentMode;
  result: DetectionResult;
  onRetry: () => void;
}

export const EnvironmentWarningModal: React.FC<EnvironmentWarningModalProps> = ({ mode, result, onRetry }) => {
  const isTest = mode === 'TEST';
  const buttonText = isTest ? 'Kiểm tra lại' : 'Kiểm tra';
  const title = 'Phát hiện tiện ích trình duyệt';
  
  let message = 'Một tiện ích trình duyệt đang tương tác với khu vực làm bài.';
  
  if (result.status === 'KNOWN_EXTENSION' && result.detectedExtensionName) {
    message = `Phát hiện ${result.detectedExtensionName} đang hoạt động trên trang.`;
  } else {
    message = 'Một tiện ích hỗ trợ AI, viết, dịch hoặc kiểm tra ngữ pháp đang tương tác với trang làm bài.';
  }

  const instructions = 'Để tránh ảnh hưởng đến quá trình nhập và lưu bài, vui lòng tạm tắt tiện ích này trên trang IELTS Thanh Lê trước khi tiếp tục.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative"
        role="dialog"
        aria-labelledby="env-warning-title"
        aria-modal="true"
      >
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        
        <h3 id="env-warning-title" className="text-lg font-bold text-gray-900 mb-2">
          {title}
        </h3>
        
        <div className="bg-amber-50/50 rounded-xl p-4 mb-6 border border-amber-100">
          <p className="text-sm font-medium text-amber-800 mb-2">
            {message}
          </p>
          <p className="text-sm text-amber-700/80">
            {instructions}
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
