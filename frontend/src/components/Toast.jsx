import React, { useEffect } from 'react';

export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClasses = {
    success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg border backdrop-blur-sm ${typeClasses[type]} animate-fade-in`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold">{icons[type]}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
