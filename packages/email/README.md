# @seedcompany/nestjs-email

A NestJS library to compose emails with JSX and send them via AWS SES or other providers.

## Features

- [Create email templates using React JSX components](#creating-email-templates) ([React](https://react.dev/))
- Support for data loading via [Suspense](#data-loading-with-suspense) ([React Suspense](https://react.dev/reference/react/Suspense)) and/or [React Server Components](#data-loading-with-react-server-components-react-19) (`async/await`)
- Optional [MJML integration](#using-mjml) ([MJML](https://mjml.io/)) for responsive email templates
- Optional support for [`react-email` components](https://react.email/)
- HTML and plain text rendering (HTML is converted to plain text)
- ([Amazon SES](https://aws.amazon.com/ses/)) integration out of the box
- Support for any [nodemailer transporters](#custom-transporter) ([Nodemailer](https://nodemailer.com/about/))

## Installation

```bash
yarn add @seedcompany/nestjs-email react react-dom
yarn add -D @types/react
```

## Module Registration

Register the module in your NestJS application:

```typescript
import { EmailModule } from '@seedcompany/nestjs-email';

@Module({
  imports: [
    EmailModule.register({
      defaultHeaders: {
        from: 'no-reply@example.com',
        replyTo: 'helpdesk@example.com',
      },
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```typescript
import { EmailModule } from '@seedcompany/nestjs-email';

@Module({
  imports: [
    EmailModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        defaultHeaders: {
          from: config.get('EMAIL_FROM'),
          replyTo: config.get('EMAIL_REPLY_TO'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Custom Transporter

```typescript
import { EmailModule } from '@seedcompany/nestjs-email';
import { createTransport } from 'nodemailer';

@Module({
  imports: [
    EmailModule.register({
      defaultHeaders: {
        from: 'no-reply@example.com',
      },
      transporter: {
        useFactory: () => {
          return createTransport({
            host: 'smtp.example.com',
            port: 587,
            secure: false,
            auth: {
              user: 'username',
              pass: 'password',
            },
          });
        },
      },
    }),
  ],
})
export class AppModule {}
```

## Usage

### Creating and Sending Emails

```tsx
import { Injectable } from '@nestjs/common';
import { MailerService, EmailMessage } from '@seedcompany/nestjs-email';

@Injectable()
export class UserService {
  constructor(private readonly mailer: MailerService) {}

  async sendWelcomeEmail(userId: string, email: string) {
    // Method 1: Using mailer.compose
    await this.mailer.compose(
      { to: email, subject: 'Welcome!' },
      <WelcomeMessage userId={userId} />
    ).send();

    // Method 2: Using EmailMessage.from
    const msg = EmailMessage.from(
      { to: email, subject: 'Welcome!' },
      <WelcomeMessage userId={userId} />
    );
    await this.mailer.send(msg);

    // Method 3: Chaining methods
    await this.mailer
      .compose(<WelcomeMessage userId={userId} />)
      .withHeaders({ to: email, subject: 'Welcome!' })
      .send();
  }
}
```

### Creating Email Templates

```tsx
import * as Meta from '@seedcompany/nestjs-email/templates';

interface WelcomeMessageProps {
  userId: string;
}

export const WelcomeMessage = ({ userId }: WelcomeMessageProps) => {
  return (
    <>
      <Meta.Headers
        subject="Welcome to our platform!" 
        from="welcome@example.com"
      />

      <h1>Welcome to our platform!</h1>

      <p>Thank you for signing up. Your user ID is: {userId}</p>

      <Meta.InHtml>
        <p>This content will only appear in the HTML version.</p>
        <a href="https://example.com/get-started">Get Started</a>
      </Meta.InHtml>

      <Meta.InText>
        This content will only appear in the plain text version.
        Visit https://example.com/get-started to get started.
      </Meta.InText>
    </>
  );
};
```

### Data Loading with React Server Components (React 19+)

```tsx
import { Headers } from '@seedcompany/nestjs-email/templates';

interface UserDetailsProps {
  userId: string;
}

const loadUser = async (id: string) => {
  // Fetch user data from API or database
  return { name: 'John Doe', email: 'john@example.com' };
};

export const UserDetailsEmail = async ({ userId }: UserDetailsProps) => {
  const user = await loadUser(userId);

  return (
    <>
      <Headers subject={`Hello ${user.name}`} />

      <h1>Hello {user.name}!</h1>
      <p>Here are your account details:</p>
      <ul>
        <li>Email: {user.email}</li>
        <li>User ID: {userId}</li>
      </ul>
    </>
  );
};
```

### Data Loading with Suspense

```tsx
import { Headers } from '@seedcompany/nestjs-email/templates';
import usePromise from 'react-promise-suspense';

interface UserDetailsProps {
  userId: string;
}

const loadUser = async (id: string) => {
  // Fetch user data from API or database
  return { name: 'John Doe', email: 'john@example.com' };
};

export const UserDetailsEmail = ({ userId }: UserDetailsProps) => {
  const user = usePromise(loadUser, [userId]);

  return (
    <>
      <Headers subject={`Hello ${user.name}`} />

      <h1>Hello {user.name}!</h1>
      <p>Here are your account details:</p>
      <ul>
        <li>Email: {user.email}</li>
        <li>User ID: {userId}</li>
      </ul>
    </>
  );
};
```

### Using MJML

```bash
yarn add mjml @faire/mjml-react
```

```tsx
import * as Meta from '@seedcompany/nestjs-email/templates';
import * as Mj from '@seedcompany/nestjs-email/templates/mjml';

interface WelcomeMessageProps {
  name: string;
}

export const WelcomeMessageMjml = ({ name }: WelcomeMessageProps) => (
  <Mj.Doc>
    <Meta.Headers subject={`Welcome ${name}!`} />

    <Mj.Head>
      <Mj.Title>Welcome Email</Mj.Title>
      <Mj.Preview>Welcome to our platform!</Mj.Preview>
    </Mj.Head>

    <Mj.Body width={600}>
      <Mj.Section>
        <Mj.Column>
          <Mj.Text color="#333" fontFamily="Helvetica" fontSize={20}>
            Hello {name}!
          </Mj.Text>
          <Mj.Text color="#333" fontFamily="Helvetica" fontSize={20}>
            Welcome to our platform. We're excited to have you on board!
          </Mj.Text>
          <Mj.Button backgroundColor="#346DB7" href="https://example.com">
            Get Started
          </Mj.Button>
        </Mj.Column>
      </Mj.Section>
    </Mj.Body>
  </Mj.Doc>
);
```

### Plain Text Only Messages

```typescript
import { MailerService } from '@seedcompany/nestjs-email';

@Injectable()
export class NotificationService {
  constructor(private readonly mailer: MailerService) {}

  async sendSimpleNotification(email: string, message: string) {
    await this.mailer
      .compose({
        to: email,
        subject: 'Notification',
        text: message
      })
      .send();
  }
}
```
