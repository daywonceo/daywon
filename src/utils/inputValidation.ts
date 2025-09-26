import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

// Password validation schema
export const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(128, { message: "Password must be less than 128 characters" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" 
  });

// Username validation schema
export const usernameSchema = z.string()
  .trim()
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(30, { message: "Username must be less than 30 characters" })
  .regex(/^[a-zA-Z0-9._]+$/, { 
    message: "Username can only contain letters, numbers, dots, and underscores" 
  });

// Habit name validation schema
export const habitNameSchema = z.string()
  .trim()
  .min(1, { message: "Habit name cannot be empty" })
  .max(100, { message: "Habit name must be less than 100 characters" })
  .regex(/^[a-zA-Z0-9\s\-_'.,!?()]+$/, { 
    message: "Habit name contains invalid characters" 
  });

// Post content validation schema
export const postContentSchema = z.string()
  .trim()
  .min(1, { message: "Post cannot be empty" })
  .max(1000, { message: "Post must be less than 1000 characters" });

// Comment validation schema
export const commentSchema = z.string()
  .trim()
  .min(1, { message: "Comment cannot be empty" })
  .max(500, { message: "Comment must be less than 500 characters" });

// Challenge name validation schema
export const challengeNameSchema = z.string()
  .trim()
  .min(3, { message: "Challenge name must be at least 3 characters" })
  .max(100, { message: "Challenge name must be less than 100 characters" });

// General text input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// URL validation for external links
export const urlSchema = z.string()
  .url({ message: "Invalid URL format" })
  .refine((url) => {
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    try {
      const parsedUrl = new URL(url);
      return allowedProtocols.includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }, { message: "URL must use http, https, or mailto protocol" });

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Global rate limiter instances
export const formSubmissionLimiter = new RateLimiter();
export const apiRequestLimiter = new RateLimiter();

// Validation utilities
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => e.message) 
      };
    }
    return { 
      success: false, 
      errors: ['Validation failed'] 
    };
  }
};