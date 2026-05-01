'use client';

const BASE_CLASS =
  'w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--secondary-color)]';

export default function FormSelect({ className = '', children, ...props }) {
  return (
    <select className={`${BASE_CLASS} ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}
