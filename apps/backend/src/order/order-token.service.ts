import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // skip I/O for shoutability
const MAX_COUNTER = 99;

@Injectable()
export class OrderTokenService {
  constructor(private readonly prisma: PrismaService) {}

  /** Short human-readable token unique per day, e.g. A23. */
  async nextToken(now = new Date()): Promise<string> {
    const dayKey = this.dayKey(now);

    const seq = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.orderTokenSequence.findUnique({
        where: { dayKey },
      });
      if (!existing) {
        return tx.orderTokenSequence.create({
          data: { dayKey, letterIndex: 0, counter: 1 },
        });
      }

      let letterIndex = existing.letterIndex;
      let counter = existing.counter + 1;
      if (counter > MAX_COUNTER) {
        letterIndex += 1;
        counter = 1;
      }
      if (letterIndex >= LETTERS.length) {
        letterIndex = 0;
      }

      return tx.orderTokenSequence.update({
        where: { dayKey },
        data: { letterIndex, counter },
      });
    });

    const letter = LETTERS[seq.letterIndex] ?? 'A';
    return `${letter}${seq.counter}`;
  }

  private dayKey(now: Date): string {
    // Cafe local timezone — Asia/Kolkata for this merchant.
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(now);
  }
}
