import { useState, useEffect, useRef, useCallback } from 'react';
import { detectBrowserInterference, DetectionResult, EnvironmentStatus } from './detectBrowserInterference';

export type AssessmentMode = 'HOMEWORK' | 'TEST';

export function useAssessmentEnvironmentCheck(mode: AssessmentMode) {
  const [hasChecked, setHasChecked] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  
  // Ref to the workspace root for scoped scanning
  const workspaceRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // Stop active monitoring (cleanup)
  const stopMonitoring = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Pre-check logic (Run once)
  const runCheck = useCallback(() => {
    const root = workspaceRef.current || document;
    const result = detectBrowserInterference(root);
    
    setDetectionResult(result.status === 'CLEAN' ? null : result);
    setHasChecked(true);
    
    return result;
  }, []);

  // Start active monitoring for Test mode
  const startMonitoring = useCallback(() => {
    if (mode !== 'TEST') return; // Homework mode only uses pre-check
    
    const targetNode = workspaceRef.current || document.body;
    
    observerRef.current = new MutationObserver(() => {
      // Throttle or debounce if necessary, but simple check is fast enough for occasional DOM mutations
      const result = detectBrowserInterference(targetNode);
      if (result.status !== 'CLEAN') {
        setDetectionResult(result);
        stopMonitoring(); // Pause monitoring while warning is shown
      }
    });

    observerRef.current.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'] // Monitor attribute injections
    });
  }, [mode, stopMonitoring]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    workspaceRef,
    hasChecked,
    detectionResult,
    runCheck,
    startMonitoring,
    stopMonitoring,
    isClean: hasChecked && !detectionResult
  };
}
