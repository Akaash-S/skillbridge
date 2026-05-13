import { useState, useEffect, useCallback, useRef } from 'react';

interface ProctoringState {
  violations: number;
  isFullscreen: boolean;
  isFocused: boolean;
  isVisible: boolean;
  lastViolationType: string | null;
}

export const useProctoring = (maxViolations: number = 3, onTerminate: () => void) => {
  const [state, setState] = useState<ProctoringState>({
    violations: 0,
    isFullscreen: false,
    isFocused: true,
    isVisible: true,
    lastViolationType: null,
  });

  const [isStarted, setIsStarted] = useState(false);
  const violationCooldown = useRef(false);

  const addViolation = useCallback((type: string) => {
    if (violationCooldown.current) return;
    
    // Add a small cooldown to prevent duplicate triggers (e.g., blur + visibilitychange)
    violationCooldown.current = true;
    setTimeout(() => { violationCooldown.current = false; }, 1500);

    setState((prev) => {
      const newCount = prev.violations + 1;
      if (newCount >= maxViolations) {
        onTerminate();
      }
      return {
        ...prev,
        violations: newCount,
        lastViolationType: type,
      };
    });
  }, [maxViolations, onTerminate]);

  // Fullscreen detection
  const checkFullscreen = useCallback(() => {
    const isFull = !!document.fullscreenElement;
    setState((prev) => ({ ...prev, isFullscreen: isFull }));
    
    if (isStarted && !isFull) {
      addViolation('Fullscreen Exit');
    }
  }, [isStarted, addViolation]);

  // Focus and Visibility detection
  const handleVisibilityChange = useCallback(() => {
    const isVisible = document.visibilityState === 'visible';
    setState((prev) => ({ ...prev, isVisible }));
    
    if (isStarted && !isVisible) {
      addViolation('Tab Switching');
    }
  }, [isStarted, addViolation]);

  const handleBlur = useCallback(() => {
    setState((prev) => ({ ...prev, isFocused: false }));
    if (isStarted) {
      addViolation('Window Focus Lost');
    }
  }, [isStarted, addViolation]);

  const handleFocus = useCallback(() => {
    setState((prev) => ({ ...prev, isFocused: true }));
  }, []);

  // Keyboard shortcut blocking
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isStarted) return;

    // F12, F11, PrintScreen, Escape, F5, F6
    const forbiddenKeys = ['F12', 'F11', 'PrintScreen', 'Escape', 'F5', 'F6'];
    const ctrlShortcuts = ['c', 'v', 'x', 'u', 'i', 'p', 's', 'a', 'j', 'k', 'r', 'l', 't', 'n', 'w'];

    if (forbiddenKeys.includes(e.key)) {
      e.preventDefault();
      addViolation(`Restricted Key: ${e.key}`);
    }

    if (e.ctrlKey || e.metaKey || e.altKey) {
      if (ctrlShortcuts.includes(e.key.toLowerCase())) {
        e.preventDefault();
        addViolation('Restricted Shortcut');
      }
      
      if (e.key === 'Tab') {
        e.preventDefault();
        addViolation('Alt+Tab Detection');
      }
    }
  }, [isStarted, addViolation]);

  // Context menu blocking
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (!isStarted) return;
    e.preventDefault();
    addViolation('Right Click Blocked');
  }, [isStarted, addViolation]);

  // Paste detection
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!isStarted) return;
    e.preventDefault();
    addViolation('Paste Attempt');
  }, [isStarted, addViolation]);

  // Copy detection
  const handleCopy = useCallback((e: ClipboardEvent) => {
    if (!isStarted) return;
    e.preventDefault();
    addViolation('Copy Attempt');
  }, [isStarted, addViolation]);

  // Select detection (fallback if CSS fails)
  const handleSelectStart = useCallback((e: Event) => {
    if (!isStarted) return;
    e.preventDefault();
  }, [isStarted]);

  // Drag detection
  const handleDragStart = useCallback((e: DragEvent) => {
    if (!isStarted) return;
    e.preventDefault();
    addViolation('Drag Attempt');
  }, [isStarted, addViolation]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Monitor resize for devtools or window snapping
    const handleResize = () => {
      if (isStarted) {
        const threshold = 160; // Common devtools min width
        if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
           addViolation('Window Resize/DevTools');
        }
      }
    };
    window.addEventListener('resize', handleResize);

    // Prevent page unload/refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStarted) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [checkFullscreen, handleVisibilityChange, handleBlur, handleFocus, handleKeyDown, handleContextMenu, handlePaste, handleCopy, handleSelectStart, handleDragStart, isStarted]);

  const startProctoring = () => {
    setIsStarted(true);
    checkFullscreen();
  };

  const stopProctoring = () => {
    setIsStarted(false);
  };

  return {
    ...state,
    isStarted,
    startProctoring,
    stopProctoring,
    resetViolations: () => setState(prev => ({ ...prev, violations: 0 }))
  };
};
