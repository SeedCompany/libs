/* eslint-disable @seedco/no-unused-vars */
import { Mjml } from '@faire/mjml-react';
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { EmailModule, EmailService } from './index';
import * as El from './templates';

export const TextBreak = () => (
  <El.InText>
    <El.Raw>
      <br />
    </El.Raw>
  </El.InText>
);

async function bootstrap() {
  const app = await NestFactory.create(
    EmailModule.forRoot({
      from: 'CORD Field <noreply@cordfield.com>',
      send: true,
      replyTo: ['support@cordfield.com', 'helpdesk@tsco.org'],
    }),
  );
  await app.init();

  const email = app.get(EmailService);
  const template = () => (
    <Mjml lang="en">
      <El.Head>
        {/* Title also sets the subject */}
        <El.Title>{`Testing - CORD Field`}</El.Title>
      </El.Head>
      <El.Body>
        <El.Section>
          <El.Column padding={0}>
            <El.Text fontSize={24} paddingTop={0} paddingBottom={0}>
              Just testing out file attachments
            </El.Text>
            <TextBreak />
            <TextBreak />
          </El.Column>
        </El.Section>

        <El.Section>
          <El.Column>
            <El.Text>
              If it was you, confirm the password change{' '}
              <El.InText>by clicking this link</El.InText>
            </El.Text>
          </El.Column>
        </El.Section>

        <El.Attachment
          data={fs.readFileSync(
            '/Users/carsonfull/Downloads/producibles.csv',
            'utf-8',
          )}
          name="producibles.csv"
          type="text/csv"
        />
      </El.Body>
    </Mjml>
  );
  const encoded = await email.render('carsonfull@gmail.com', template, {});

  await email.sendMessage(encoded);

  console.log('done');
}
bootstrap()
  .then(() => process.exit())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
