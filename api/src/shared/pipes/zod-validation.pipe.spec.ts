import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    email: z.string().email(),
  });

  it('returns parsed data when valid', () => {
    const pipe = new ZodValidationPipe(schema);
    const result = pipe.transform({ email: 'a@b.com' }, {} as never);
    expect(result).toEqual({ email: 'a@b.com' });
  });

  it('throws BadRequestException with treeified error when invalid', () => {
    const pipe = new ZodValidationPipe(schema);
    expect(() => pipe.transform({ email: 'not-email' }, {} as never)).toThrow(
      BadRequestException,
    );
    try {
      pipe.transform({ email: 'not-email' }, {} as never);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const res = (e as BadRequestException).getResponse();
      expect(res).toBeDefined();
    }
  });
});
