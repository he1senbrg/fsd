'use client';

const BASE_CLASS =
  'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary-color)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANT_CLASS = {
  unstyled: '',
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'text-stone-600 hover:text-[var(--primary-color)] hover:bg-stone-50',
  subtle: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
  soft: 'bg-orange-50 text-[var(--primary-color)] border border-orange-200 hover:bg-orange-100',
  success: 'bg-green-600 text-white hover:bg-green-700',
  successSoft: 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  dangerGhost: 'text-red-500 hover:bg-red-50',
  overlay: 'bg-white/20 backdrop-blur text-white border border-white/30 hover:bg-white/30',
  overlayIcon: 'bg-white/10 text-white/80 hover:text-white rounded-full',
  iconGhost: 'text-stone-500 hover:text-[var(--primary-color)]',
  iconSurface: 'p-2 text-stone-400 hover:text-[var(--primary-color)] rounded-lg hover:bg-stone-50',
};

const SIZE_CLASS = {
  auto: '',
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'w-10 h-10 inline-flex items-center justify-center',
  iconSm: 'w-8 h-8 inline-flex items-center justify-center',
};

const SHAPE_CLASS = {
  auto: '',
  rounded: 'rounded-lg',
  pill: 'rounded-full',
  square: 'rounded-md',
  full: 'rounded-full',
};

function cx(...classes) {
  return classes.filter(Boolean).join(' ').trim();
}

export default function Button({
  variant = 'unstyled',
  size = 'auto',
  shape = 'auto',
  className = '',
  block = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  children,
  disabled,
  ...props
}) {
  const resolvedDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={resolvedDisabled}
      className={cx(
        BASE_CLASS,
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        SHAPE_CLASS[shape],
        block && 'w-full',
        className,
      )}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[1.1em]">
          progress_activity
        </span>
      ) : null}
      {!loading && leadingIcon ? (
        <span className="material-symbols-outlined text-[1.1em]">{leadingIcon}</span>
      ) : null}
      {children}
      {!loading && trailingIcon ? (
        <span className="material-symbols-outlined text-[1.1em]">{trailingIcon}</span>
      ) : null}
    </button>
  );
}
