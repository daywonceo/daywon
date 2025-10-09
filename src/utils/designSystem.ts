/**
 * Standardized spacing scale based on design system
 * Use these constants for consistent spacing across components
 */
export const SPACING = {
  // Base unit (4px)
  unit: 4,
  
  // Component spacing
  xs: 'p-2',      // 8px
  sm: 'p-3',      // 12px
  md: 'p-4',      // 16px
  lg: 'p-6',      // 24px
  xl: 'p-8',      // 32px
  '2xl': 'p-12',  // 48px
  
  // Card padding
  cardPadding: {
    mobile: 'p-4',   // 16px
    desktop: 'p-6',  // 24px
  },
  
  // Section spacing
  sectionGap: {
    mobile: 'space-y-4',   // 16px
    desktop: 'space-y-6',  // 24px
  },
  
  // List spacing
  listGap: {
    tight: 'space-y-2',     // 8px
    normal: 'space-y-3',    // 12px
    relaxed: 'space-y-4',   // 16px
  },
  
  // Responsive padding
  responsive: {
    page: 'px-4 sm:px-6 lg:px-8',
    container: 'px-4 sm:px-6 lg:px-8',
    card: 'p-4 sm:p-6',
    section: 'py-6 sm:py-8 lg:py-12',
  }
} as const;

/**
 * Standardized color utilities
 * Use these to ensure semantic color usage
 */
export const SEMANTIC_COLORS = {
  // Status
  success: {
    bg: 'bg-success/10',
    border: 'border-success/20',
    text: 'text-success',
    icon: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'text-warning',
    icon: 'text-warning',
  },
  error: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    text: 'text-destructive',
    icon: 'text-destructive',
  },
  info: {
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    text: 'text-primary',
    icon: 'text-primary',
  },
  
  // Interactive states
  interactive: {
    default: 'hover:bg-accent/50 active:bg-accent',
    subtle: 'hover:bg-muted/50',
    ghost: 'hover:bg-accent/10',
  },
  
  // Content types
  habit: {
    completed: 'text-success',
    pending: 'text-muted-foreground',
    failed: 'text-destructive',
  }
} as const;

/**
 * Button variant class combinations
 * Standardized button styles
 */
export const BUTTON_VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
  success: 'bg-success text-success-foreground hover:opacity-90',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
} as const;

/**
 * Common component patterns
 */
export const COMPONENT_PATTERNS = {
  card: {
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    interactive: 'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow',
    compact: 'rounded-md border bg-card p-3',
  },
  
  badge: {
    default: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    error: 'bg-destructive/10 text-destructive border border-destructive/20',
    info: 'bg-primary/10 text-primary border border-primary/20',
  },
  
  input: {
    base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  }
} as const;
