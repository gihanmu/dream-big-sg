import { fileTypeFromBuffer } from 'file-type';

// MIME types allowed for image uploads
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

// Maximum file size in bytes (8MB)
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: string;
  fileSize?: number;
}

/**
 * Validates an uploaded image file
 */
export async function validateImageFile(buffer: Buffer): Promise<ImageValidationResult> {
  try {
    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size too large. Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        fileSize: buffer.length
      };
    }

    // Detect file type
    const fileType = await fileTypeFromBuffer(buffer);
    
    if (!fileType) {
      return {
        isValid: false,
        error: 'Could not determine file type',
        fileSize: buffer.length
      };
    }

    // Check if file type is allowed
    if (!ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        fileType: fileType.mime,
        fileSize: buffer.length
      };
    }

    return {
      isValid: true,
      fileType: fileType.mime,
      fileSize: buffer.length
    };

  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate file',
      fileSize: buffer.length
    };
  }
}

/**
 * Strips EXIF data from image buffer (for privacy)
 */
export function stripExifData(imageDataUrl: string): string {
  try {
    // For data URLs, we can create a canvas and redraw the image
    // This effectively strips EXIF data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise<string>((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imageDataUrl;
    }) as unknown as string;
    
  } catch (error) {
    console.error('Failed to strip EXIF data:', error);
    return imageDataUrl;
  }
}

/**
 * Sanitizes text input to prevent XSS
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Rate limiting for API requests
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) { // 10 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Clean old requests
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    const now = Date.now();
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

export const imagenRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute

/**
 * Validates environment variables for security
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.GOOGLE_PROJECT_ID) {
    errors.push('GOOGLE_PROJECT_ID environment variable is required');
  }
  
  if (!process.env.GOOGLE_VERTEX_CREDENTIALS_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    errors.push('Google Cloud credentials are required (either GOOGLE_VERTEX_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}