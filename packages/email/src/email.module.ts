import {
  SendEmailCommand,
  SESv2Client as SES,
  type SESv2ClientConfig as SESConfig,
} from '@aws-sdk/client-sesv2';
import {
  ConfigurableModuleBuilder,
  Logger,
  Module,
  type Provider,
  type Type,
} from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { DistributedOmit } from 'type-fest';
import { EMAIL_MODULE_OPTIONS, type EmailOptions } from './email.options.js';
import { EmailService } from './email.service.js';
import { NodeMailerLoggerAdapter } from './logger.js';
import { Transporter } from './transporter.js';

type TransporterProvider = DistributedOmit<
  Exclude<Provider<Transporter>, Type>,
  'provide'
>;

const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<EmailOptions>({
    moduleName: 'Email',
    optionsInjectionToken: EMAIL_MODULE_OPTIONS,
  })
    .setExtras<{
      global?: boolean;
      /**
       * Provide your own transporter.
       */
      transporter?: TransporterProvider;
      /**
       * SES client to use or options to create the client with.
       * This is ignored if {@link transporter} is used.
       */
      ses?: SES | SESConfig;
    }>({ global: false }, (definition, { global, transporter, ses }) => ({
      ...definition,
      global,
      providers: [
        ...(definition.providers ?? []),
        {
          ...(transporter ?? {
            useFactory: (): Transporter => {
              const sesClient =
                ses instanceof SES
                  ? ses
                  : new SES({ region: 'us-east-1', ...ses });
              return createTransport({
                SES: { sesClient, SendEmailCommand },
                logger: new NodeMailerLoggerAdapter(new Logger('Email')),
              });
            },
          }),
          provide: Transporter,
        },
      ],
    }))
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
