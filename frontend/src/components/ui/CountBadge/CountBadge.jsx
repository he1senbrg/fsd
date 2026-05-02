'use client';

export default function CountBadge({
  count = 0,
  max = 9,
  className = '',
  colorClassName = 'bg-[var(--primary-color)]',
  bordered = true,
}) {
  if (!count || count < 1) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] ${colorClassName} text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ${bordered ? 'border-2 border-white' : ''} ${className}`.trim()}
    >
      {displayCount}
    </span>
  );
}
