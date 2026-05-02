'use client';

export default function SurfaceCard({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={`bg-white rounded-xl shadow-sm border border-orange-100 ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
