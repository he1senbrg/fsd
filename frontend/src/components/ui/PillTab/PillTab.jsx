'use client';

import Button from '../Button/Button';

const BASE_CLASS =
  'px-5 py-2 rounded-full text-sm whitespace-nowrap font-medium border transition-colors';
const ACTIVE_CLASS = 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]';
const INACTIVE_CLASS =
  'bg-white border-stone-200 text-stone-600 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]';

export default function PillTab({
  active = false,
  className = '',
  activeClassName = ACTIVE_CLASS,
  inactiveClassName = INACTIVE_CLASS,
  children,
  type = 'button',
  ...props
}) {
  return (
    <Button
      variant="unstyled"
      type={type}
      className={`${BASE_CLASS} ${active ? activeClassName : inactiveClassName} ${className}`.trim()}
      {...props}
    >
      {children}
    </Button>
  );
}
