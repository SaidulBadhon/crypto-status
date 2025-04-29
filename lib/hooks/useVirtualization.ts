import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVirtualizationOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

interface UseVirtualizationResult<T> {
  virtualItems: Array<{ index: number; item: T }>;
  containerRef: React.RefObject<HTMLDivElement>;
  totalHeight: number;
}

/**
 * A hook that implements virtualization for a list of items.
 * @param items The list of items to virtualize
 * @param options Configuration options
 * @returns The virtualized items and a ref to attach to the container
 */
export function useVirtualization<T>(
  items: T[],
  options: UseVirtualizationOptions
): UseVirtualizationResult<T> {
  const { itemHeight, overscan = 3, containerHeight = 500 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate the range of visible items
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Create the virtual items
  const virtualItems = items
    .slice(startIndex, endIndex + 1)
    .map((item, i) => ({
      index: startIndex + i,
      item,
    }));

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Set up the scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  return {
    virtualItems,
    containerRef,
    totalHeight: items.length * itemHeight,
  };
}
