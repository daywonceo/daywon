import React, { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemSize?: number;
  overscan?: number;
  height: number;
  className?: string;
  onEndReached?: () => void;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
  emptyComponent?: React.ReactNode;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemSize = 100,
  overscan = 10,
  height,
  className = '',
  onEndReached,
  loadingComponent,
  isLoading = false,
  emptyComponent,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize,
    overscan,
  });

  // Handle infinite scrolling
  const lastItem = virtualizer.getVirtualItems().at(-1);
  React.useEffect(() => {
    if (
      lastItem &&
      lastItem.index >= items.length - 1 &&
      onEndReached &&
      !isLoading
    ) {
      onEndReached();
    }
  }, [lastItem, items.length, onEndReached, isLoading]);

  const virtualItems = virtualizer.getVirtualItems();

  if (items.length === 0 && !isLoading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
        role="region"
        aria-label="Empty list"
      >
        {emptyComponent || (
          <p className="text-muted-foreground">No items to display</p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      role="list"
      aria-label={`List with ${items.length} items`}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
            role="listitem"
            tabIndex={-1}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
        
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: `${virtualizer.getTotalSize()}px`,
              left: 0,
              width: '100%',
              padding: '16px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {loadingComponent || (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading more...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Grid virtualization for card layouts
interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  itemWidth?: number;
  gap?: number;
  height: number;
  className?: string;
  onEndReached?: () => void;
  isLoading?: boolean;
  emptyComponent?: React.ReactNode;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  itemHeight = 200,
  itemWidth = 300,
  gap = 16,
  height,
  className = '',
  onEndReached,
  isLoading = false,
  emptyComponent,
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const { columnsPerRow, actualItemWidth } = useMemo(() => {
    const containerWidth = parentRef.current?.clientWidth || 800;
    const availableWidth = containerWidth - gap;
    const cols = Math.floor(availableWidth / (itemWidth + gap));
    const actualWidth = (availableWidth - (cols - 1) * gap) / cols;
    
    return {
      columnsPerRow: Math.max(1, cols),
      actualItemWidth: actualWidth,
    };
  }, [itemWidth, gap]);

  const rowCount = Math.ceil(items.length / columnsPerRow);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Handle infinite scrolling
  const lastItem = virtualItems.at(-1);
  React.useEffect(() => {
    if (
      lastItem &&
      lastItem.index >= rowCount - 1 &&
      onEndReached &&
      !isLoading
    ) {
      onEndReached();
    }
  }, [lastItem, rowCount, onEndReached, isLoading]);

  if (items.length === 0 && !isLoading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
        role="grid"
        aria-label="Empty grid"
      >
        {emptyComponent || (
          <p className="text-muted-foreground">No items to display</p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      role="grid"
      aria-label={`Grid with ${items.length} items`}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * columnsPerRow;
          const endIndex = Math.min(startIndex + columnsPerRow, items.length);
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${itemHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'flex',
                gap: `${gap}px`,
                paddingLeft: `${gap / 2}px`,
                paddingRight: `${gap / 2}px`,
              }}
              role="row"
            >
              {Array.from({ length: endIndex - startIndex }).map((_, colIndex) => {
                const itemIndex = startIndex + colIndex;
                const item = items[itemIndex];
                
                return (
                  <div
                    key={itemIndex}
                    style={{
                      width: `${actualItemWidth}px`,
                      height: `${itemHeight}px`,
                      flexShrink: 0,
                    }}
                    role="gridcell"
                    tabIndex={-1}
                  >
                    {renderItem(item, itemIndex)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}