/**
 * @deprecated Use components from '@/lib/async/AsyncStateManager' instead
 * This file is kept for backward compatibility
 */

export { ErrorDisplay, InlineError, EmptyState } from '@/lib/async/AsyncStateManager';

// For backward compatibility, re-export with old names
export { ErrorDisplay as ErrorMessage } from '@/lib/async/AsyncStateManager';
export { ErrorDisplay as ErrorCard } from '@/lib/async/AsyncStateManager';

export type ErrorType = 'network' | 'server' | 'timeout' | 'notfound' | 'unauthorized' | 'generic';
