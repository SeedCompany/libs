# Upgrading to v5

v5 revamps everything from the public surface area to the underlying implementation.
It adds support for other React JSX based email components, like `react-email`,
and allows loading data in templates via Suspense or React Server Components.
It uses nodemailer to do the message compilation & transporting.

## Data Loading / Suspense / RSC

This allows templates to do async work.

### Suspense
Any `Suspense` style loading works:

```tsx
import usePromise from 'react-promise-suspense';

const loadUser = async (id: string) => { /* ... */ };

const ShowUser = ({ userId }) => {
  const user = usePromise(loadUser, [userId]);
  return <>{user.name}</>;
};
```

### React Server Components (RSC)

If using React 19, the components can be async:
```tsx
const loadUser = async (id: string) => { /* ... */ };

const ShowUser = async ({ userId }) => {
  const user = await loadUser(userId);
  return <>{user.name}</>;
};
```

## MJML

MJML is now optional. To keep using it, you need to add the dependencies explicitly:
```
yarn add mjml @faire/mjml-react
```

The MJML components are now re-exported from:
```ts
import * as Mj from '@seedcompany/nestjs-email/templates/mjml';
```

These component types currently don't compile with React 19, but this can be worked around with:
```json
"skipLibCheck": true
```
A fix for this is pending here: [mjml-react#133](https://github.com/Faire/mjml-react/pull/133)

## Module Registration

The registration methods were renamed to be more idiomatic:
```diff
  imports: [
-    EmailModule.forRoot(...)
+    EmailModule.register(...)
     // or
-    EmailModule.forRootAsync(...)
+    EmailModule.registerAsync(...)
  ]
```

And the configuration structure has changed:
```diff
  EmailModule.register({
-    from: 'no-reply@example.com',
-    replyTo: 'helpdesk@example.com',
+    defaultHeaders: {
+      from: 'no-reply@example.com',
+      replyTo: 'helpdesk@example.com',
+    },
  })
```

## Service Rename

The main service has been renamed to better convey it is an actor:
```diff
- import { EmailService } from '@seedcompany/nestjs-email';
+ import { MailerService } from '@seedcompany/nestjs-email';

- constructor(private readonly emailService: EmailService) {}
+ constructor(private readonly mailer: MailerService) {}
```

## Rendering and Sending

Rendering now happens lazily when `send()` is called. For this reason, `render` was renamed to `compose`.
Additionally, its parameters have been updated.
`send()` no longer will compose messages, and only accepts a `EmailMessage` object.

Messages can be composed with the `EmailMessage` class or with `MailerService.compose`

```tsx
import { EmailMessage } from '@seedcompany/nestjs-email';
import { MailerService } from '@seedcompany/nestjs-email/src';

const mailer: MailerService = ...;

const msg = EmailMessage.from(...);
const msg = mailer.compose(...);

await mailer.send(msg);

// Messages created from the mailer service can be sent directly.
await mailer.compose(...).send();
```

### Headers

Just like `render`/`send` before, a _to_ address can be given first, but now any headers can also be given:
```ts
compose('user@example.com', ...)
compose({ to: 'user@example.com', cc: 'bar@example.com' }, ...)
```

All headers can also be omitted and given later:
```ts
compose(...)
.withHeaders({ to: 'user@example.com' })
```
Note that this `.withHeaders()` was renamed from `.with()` in v4.

#### JSX Headers

We now provide a `Headers` component that can declare any headers.
```tsx
<Headers
  from="noreply+notification@example.com"
  subject="Some notification"
/>
```
Headers declared here take precedence over the `defaultHeaders` declared in the module config.  
Headers declared on the `EmailMessage` take precedence over the headers in the JSX body.


### Body

"Body" is now what the given JSX is called.

JSX can now be given directly
```tsx
compose(<WelcomeMessage userId={id} />)
```
In case you don't want to use JSX in your file, the component & its props can be passed, just like before, except now
they're in a tuple.
```tsx
compose([WelcomeMessage, { userId: id }])
```

Of course, the headers can be declared before the body as well:
```tsx
compose(
  { cc: 'bar@example.com' },
  <WelcomeMessage userId={id} />
)
compose(
  { cc: 'bar@example.com' },
  [WelcomeMessage, { userId: id }]
)
```

The body can also be swapped out before sending if needed:
```tsx
compose(<WelcomeMessage userId={id} />)
  .withBody(<WelcomeMessage userId={id} anotherFlag />)
```

#### Plain text only / Bodiless messages

HTML rendering can be skipped completely now as well:
```ts
compose({
  to: 'user@example.com',
  text: 'Hello World!'
})
```

## Subject

Previously, the exported `<Title>` component would automatically set the subject.
Now you need to explicitly set the subject using the `<Headers>` component:

```diff
  <Title>A Notification</Title>
+ <Headers subject="A Notification" />
```

Or in the message composition:

```tsx
compose({ subject: "A Notification" })
  // or
  .withHeaders({ subject: "A Notification" })
```

## Text Rendering

The components for controlling text rendering have changed:
```diff
- <HideInText>Only in HTML</HideInText>
+ <InHtml>Only in HTML</InHtml>

  <InText>Only in text</InText>
```

The `inText` hook has been removed.
Before we rendered React twice, once for HTML and once for text.
This allowed conditional JS logic based on the specific output.
Now that bodies can be async, we don't want to do that work twice.
Templates must declare both text & HTML outputs at the same time.
Internally, we split & prune after the React rendering is done.

This is controlled by a `data-render-only="text/html"` attribute.
This can appear on any element in the render. The attribute will be stripped out before sending,
and the element will be removed if it is the opposite output format.
