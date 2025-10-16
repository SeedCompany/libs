import { Test } from '@nestjs/testing';
import { delay } from '@seedcompany/common';
import { expect, test } from 'vitest';
import { EmailModule, MailerService } from '../src/index.js';
import { useModuleRef } from '../src/templates/index.js';

test('async render', async () => {
  class TestThing {
    async getItem() {
      await delay(10);
      return 'yo';
    }
  }
  const module = await Test.createTestingModule({
    imports: [
      EmailModule.registerAsync({
        useFactory: () => ({
          send: false,
          open: false,
          defaultHeaders: {
            from: 'unknown@email.com',
          },
        }),
      }),
    ],
    providers: [TestThing],
  }).compile();
  const mailer = module.get(MailerService);

  const Template = async () => {
    const item = await useModuleRef()
      .get(TestThing, { strict: false })
      .getItem();
    return <div>{item}</div>;
  };

  const msg = mailer.compose(<Template />);
  const rendered: typeof msg = (mailer as any).render(msg);
  expect(rendered.headers.text).toBe('yo');
});
