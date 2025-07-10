import { Test } from '@nestjs/testing';
import { describe, it } from 'vitest';
import { EmailModule } from './email.module.js';
import { EmailService } from './email.service.js';

describe('EmailModule', () => {
  it('should be creatable with registerAsync()', async () => {
    const module = await Test.createTestingModule({
      imports: [
        EmailModule.register({
          from: 'unknown@email.com',
        }),
      ],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    await app.close();
  });

  it('should be creatable with registerAsync()', async () => {
    const module = await Test.createTestingModule({
      imports: [
        EmailModule.registerAsync({
          useFactory: () => ({
            from: 'unknown@email.com',
          }),
        }),
      ],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    app.get(EmailService);
    await app.close();
  });
});
