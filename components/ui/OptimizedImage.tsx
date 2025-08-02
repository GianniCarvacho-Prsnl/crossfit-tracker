import Image from 'next/image';
import { ComponentProps, useState } from 'react';

interface OptimizedImageProps extends Omit<ComponentProps<typeof Image>, 'src'> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

/**
 * Optimized image component using Next.js Image with performance optimizations
 * Automatically handles WebP/AVIF formats, lazy loading, responsive sizing, and error handling
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  fallbackSrc,
  ...props 
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${isLoading ? 'animate-pulse bg-gray-200' : ''} ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
}