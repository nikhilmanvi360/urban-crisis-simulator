interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', color = 'blue', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-4',
  };

  const colorClasses: Record<string, string> = {
    blue: 'border-blue-500',
    red: 'border-red-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    orange: 'border-orange-500',
    indigo: 'border-indigo-500',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-t-transparent ${sizeClasses[size]} ${
          colorClasses[color] || colorClasses.blue
        }`}
      ></div>
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );
}
