import React from 'react';

export const LoadingSpinner = ({ size = 'md', color = 'white', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    white: 'text-white',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    gray: 'text-gray-400'
  };

  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const LoadingOverlay = ({ message = 'Carregando...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/90 rounded-xl p-8 flex flex-col items-center gap-4 border border-white/10">
        <LoadingSpinner size="lg" />
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
};

export const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`relative ${props.className} ${loading ? 'cursor-not-allowed' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </button>
  );
};

export const LoadingCard = ({ title = 'Carregando dados...' }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[200px]">
      <LoadingSpinner size="lg" color="blue" />
      <p className="text-white/60">{title}</p>
    </div>
  );
};