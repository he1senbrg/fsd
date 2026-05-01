'use client';

export default function PageHeader({
  title,
  subtitle,
  icon,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  centered = false,
  children,
}) {
  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`.trim()}>
      <h1
        className={`text-3xl font-bold text-[var(--text-primary)] mb-2 font-display ${titleClassName}`.trim()}
      >
        {icon ? <span className="material-symbols-outlined align-middle mr-2">{icon}</span> : null}
        {title}
      </h1>
      {subtitle ? (
        <p className={`text-[var(--text-secondary)] mb-8 ${subtitleClassName}`.trim()}>
          {subtitle}
        </p>
      ) : null}
      {children}
    </div>
  );
}
