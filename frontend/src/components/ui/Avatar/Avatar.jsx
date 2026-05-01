'use client';

import Image from 'next/image';

export default function Avatar({
  src,
  alt = 'Avatar',
  fallbackSrc = '/avatar-placeholder.svg',
  sizeClassName = 'w-10 h-10',
  className = '',
  imageClassName = 'w-full h-full object-cover',
  ...props
}) {
  return (
    <div className={`${sizeClassName} rounded-full overflow-hidden ${className}`.trim()} {...props}>
      <Image
        alt={alt}
        src={src || fallbackSrc}
        width={160}
        height={160}
        className={imageClassName}
        unoptimized
      />
    </div>
  );
}
