'use client';

const BASE_CLASS =
  'w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--secondary-color)] resize-none';

export default function FormTextarea({ className = '', ...props }) {
  return <textarea className={`${BASE_CLASS} ${className}`.trim()} {...props} />;
}
