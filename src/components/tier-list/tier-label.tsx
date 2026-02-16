import { cn } from '@/lib/utils';

interface TierLabelProps {
  label: string;
  className?: string;
}

const TIER_COLORS: Record<string, string> = {
  S: 'bg-gradient-to-br from-pink-500 to-purple-600',
  A: 'bg-gradient-to-br from-orange-500 to-red-600',
  B: 'bg-gradient-to-br from-green-500 to-emerald-600',
  C: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  D: 'bg-gradient-to-br from-purple-500 to-indigo-600',
  F: 'bg-gradient-to-br from-gray-500 to-slate-600',
};

export function TierLabel({ label, className }: TierLabelProps) {
  const colorClass = TIER_COLORS[label.toUpperCase()] || 'bg-gradient-to-br from-gray-500 to-gray-600';

  return (
    <div
      className={cn(
        'w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0',
        colorClass,
        className
      )}
    >
      {label}
    </div>
  );
}
