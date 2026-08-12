import { HttpException, HttpStatus } from '@nestjs/common';

type Bucket = { count: number; resetAt: number };

/** Simple process-local rate limiter (fine for a single API instance). */
export class InMemoryRateLimit {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  hit(key: string): void {
    const now = Date.now();
    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt < now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }
    existing.count += 1;
    if (existing.count > this.max) {
      throw new HttpException('Too many requests — try again later', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
