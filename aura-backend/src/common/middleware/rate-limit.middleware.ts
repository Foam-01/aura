import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly attempts = new Map<
    string,
    { count: number; resetAt: number }
  >();
  private readonly windowMs = 15 * 60 * 1000;
  private readonly maxAttempts = 10;

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = Array.isArray(ip) ? ip[0] : String(ip);
    const now = Date.now();

    const current = this.attempts.get(key);
    if (!current || current.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return next();
    }

    if (current.count >= this.maxAttempts) {
      return res.status(429).json({
        statusCode: 429,
        message: 'Too many attempts. Please try again later.',
      });
    }

    current.count += 1;
    next();
  }
}
