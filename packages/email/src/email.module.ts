import {
  SESv2Client as SES,
  type SESv2ClientConfig as SESConfig,
} from '@aws-sdk/client-sesv2';
import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import {
  EMAIL_MODULE_OPTIONS,
  type EmailOptions,
  SES_TOKEN,
} from './email.options.js';
import { EmailService } from './email.service.js';

const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<EmailOptions>({
    moduleName: 'Email',
    optionsInjectionToken: EMAIL_MODULE_OPTIONS,
  })
    .setExtras<{ global?: boolean; ses?: SES | SESConfig }>(
      { global: false },
      (definition, { global, ses }) => ({
        ...definition,
        global,
        providers: [
          ...(definition.providers ?? []),
          {
            provide: SES_TOKEN,
            useValue:
              ses instanceof SES
                ? ses
                : new SES({ region: 'us-east-1', ...ses }),
          },
        ],
      }),
    )
    .build();

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule extends ConfigurableModuleClass {}

export type EmailModuleOptions = typeof OPTIONS_TYPE;
export type EmailOptionsFactory = InstanceType<
  (typeof ASYNC_OPTIONS_TYPE)['useClass'] & {}
>;
