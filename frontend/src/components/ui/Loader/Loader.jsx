'use client';

export default function Loader({
  className = '',
  iconClassName = '',
  size = 'text-4xl',
  inline = false,
  label = '',
  labelClassName = 'text-sm text-stone-500',
}) {
  const baseClass = label
    ? 'flex flex-col items-center justify-center gap-4 py-20'
    : inline
      ? 'flex items-center justify-center'
      : 'flex items-center justify-center py-20';

  return (
    <div className={`${baseClass} ${className}`.trim()}>
      <span
        className={`material-symbols-outlined animate-spin text-[var(--secondary-color)] ${size} ${iconClassName}`.trim()}
        aria-hidden="true"
      >
        progress_activity
      </span>
      {label ? <p className={labelClassName}>{label}</p> : null}
    </div>
  );
}
