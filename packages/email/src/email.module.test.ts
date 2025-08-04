import { Test } from '@nestjs/testing';
import { describe, it } from 'vitest';
import { EmailModule } from './email.module.js';
import { MailerService } from './mailer.service.js';

describe('EmailModule', () => {
  it('should be creatable with registerAsync()', async () => {
    const module = await Test.createTestingModule({
      imports: [
        EmailModule.register({
          defaultHeaders: {
            from: 'unknown@email.com',
          },
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
            defaultHeaders: {
              from: 'unknown@email.com',
            },
          }),
        }),
      ],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    app.get(MailerService);
    await app.close();
  });
});
