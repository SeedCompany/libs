# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [5.0.0](https://github.com/SeedCompany/libs/compare/email-4.3.0...email-5.0.0) (2025-08-04)


### ⚠ BREAKING CHANGES

* **email:** unify react render for text/html split
* **email:** rename EmailService to MailerService
* **email:** support "bodiless" / text-only messages
* **email:** switch to nodemailer for message compilation and transport
* **email:** replace `EmailMessage.to` with `primaryRecipients` to account for cc/bcc
* **email:** replace <Subject>/<Attachment> with <Headers>
* **email:** replace specific from/replyTo headers with any `defaultHeaders` option
* **email:** rewrite signatures for message creation/modification
* **email:** support passing in elements
* **email:** make MJML optional
* **email:** move mjml to its own subpath export
* **email:** use nest's configurable module builder
* **email:** `<Title>` -> `<Subject>` & no auto mjml title
* **email:** lazily render template

### Features

* **email:** add experimental module ref hook for accessing services in templates ([64f1b7f](https://github.com/SeedCompany/libs/commit/64f1b7f8521495be5576267de56bbfc35501a8e1))
* **email:** allow text header to override plain-text rendering from the body ([d87eb8e](https://github.com/SeedCompany/libs/commit/d87eb8e339b4dbe07093f8901803bf484a2c3e7d))
* **email:** make MJML optional ([0a35a03](https://github.com/SeedCompany/libs/commit/0a35a0300c7f072c96f9886fb819a1115cd6b3ce))
* **email:** support "bodiless" / text-only messages ([fd5dcb7](https://github.com/SeedCompany/libs/commit/fd5dcb71a0566d1666f6b292100a7c6a61efcd99))
* **email:** support passing headers to send ([d0ff949](https://github.com/SeedCompany/libs/commit/d0ff949ab01f090693da8c83bc892bcba7cc9b94))
* **email:** support passing in elements ([bf45155](https://github.com/SeedCompany/libs/commit/bf4515564bae4ec921154184b6e6adfdf44a315d))
* **email:** support Suspense / RSC with React 19 ([db8da14](https://github.com/SeedCompany/libs/commit/db8da14dbe8c06d0cb36c517f9dadb86420ef29a))
* **email:** switch to nodemailer for message compilation and transport ([f9ba7ac](https://github.com/SeedCompany/libs/commit/f9ba7ac167b420d8b9c5890dcb4c866d29f94b13))
* **email:** unify react render for text/html split ([2f6d39c](https://github.com/SeedCompany/libs/commit/2f6d39c6b696e4bd6d037baa2aa50a9ed1b47c05))


### Bug Fixes

* **email:** mark @types/react as peer dep since it's used in public surface area ([698c442](https://github.com/SeedCompany/libs/commit/698c442e277f64481900b326a97276af7889cc34))


### Code Refactoring

* **email:** `<Title>` -> `<Subject>` & no auto mjml title ([bfa33d0](https://github.com/SeedCompany/libs/commit/bfa33d0d08a7836e801a9f9be615dea63703c19b))
* **email:** lazily render template ([7c43147](https://github.com/SeedCompany/libs/commit/7c43147c3e666a4a878573ae5261c20c98881a38))
* **email:** move mjml to its own subpath export ([17cc158](https://github.com/SeedCompany/libs/commit/17cc1583a1b0163c4ab7eadba25725b5797ce96f))
* **email:** rename EmailService to MailerService ([e2af78a](https://github.com/SeedCompany/libs/commit/e2af78a362161c2b79f576435d152dd3dedca971))
* **email:** replace `EmailMessage.to` with `primaryRecipients` to account for cc/bcc ([d47a53c](https://github.com/SeedCompany/libs/commit/d47a53caf7b7c5cb8f8ea83fb7ec8ad9abb20512))
* **email:** replace <Subject>/<Attachment> with <Headers> ([dba0b7d](https://github.com/SeedCompany/libs/commit/dba0b7db8bae42a0cb5a7f9a3f95f56777566411))
* **email:** replace specific from/replyTo headers with any `defaultHeaders` option ([815bfbc](https://github.com/SeedCompany/libs/commit/815bfbcac402149ece0d166924b14d4fb00d9357))
* **email:** rewrite signatures for message creation/modification ([0fcd87e](https://github.com/SeedCompany/libs/commit/0fcd87efdedccceaccec3ea43055c49faab93784))
* **email:** use nest's configurable module builder ([0f757c8](https://github.com/SeedCompany/libs/commit/0f757c804b7cb967df06ae94fc05482a605e127e))

## [4.3.0](https://github.com/SeedCompany/libs/compare/email-4.2.1...email-4.3.0) (2025-07-09)


### Features

* **email:** add `EmailMessage.with()` to easily allow additional headers ([39dabee](https://github.com/SeedCompany/libs/commit/39dabee4970b6ce78634b545d8928a9a37321545))
* **email:** add `EmailService.withOptions()` to adjust options/wrapper per email message ([c3c90d7](https://github.com/SeedCompany/libs/commit/c3c90d70869e3dc38e9babb313d6f610f950ff66))
* **email:** allow `send` to accept rendered messages ([c011ec2](https://github.com/SeedCompany/libs/commit/c011ec269ebc830b730dad65e334d35b0a733a5d))
* **email:** allow chaining `render().send()` ([ebddffd](https://github.com/SeedCompany/libs/commit/ebddffda375c7c31429b2fe6fd989812ad69c421))
* **email:** Better header composition & service API ([#52](https://github.com/SeedCompany/libs/issues/52)) ([75d4f75](https://github.com/SeedCompany/libs/commit/75d4f75662f3f4ace7e8e3b02ba0fffb692c57b8))
* **email:** export `EmailMessage` class ([5067ab8](https://github.com/SeedCompany/libs/commit/5067ab88b6051376bf8aebdf63deb7c1dcbec205))

## [4.2.1](https://github.com/SeedCompany/libs/compare/email-4.2.0...email-4.2.1) (2025-07-01)


### Bug Fixes

* **email:** hide emailjs usage from TS ([#51](https://github.com/SeedCompany/libs/issues/51)) ([7ee9a4e](https://github.com/SeedCompany/libs/commit/7ee9a4eaea9056829ba62aa4a6631da94f3fbf51))

## [4.2.0](https://github.com/SeedCompany/libs/compare/email-4.1.1...email-4.2.0) (2025-04-30)


### Features

* **email:** allow reflect-metadata 0.2 ([b93fb26](https://github.com/SeedCompany/libs/commit/b93fb265ea9196da74f4fda4dd9d68f758f17a0c))

## [4.1.1](https://github.com/SeedCompany/libs/compare/email-4.1.0...email-4.1.1) (2025-03-13)


### Bug Fixes

* **email:** declare types field in package.json for JetBrains ([8349123](https://github.com/SeedCompany/libs/commit/8349123ca34ae9b218808869a9a162146b3e4ff2))

## [4.1.0](https://github.com/SeedCompany/libs/compare/email-4.0.2...email-4.1.0) (2025-03-13)


### Features

* **email:** declare support for Nest 11 ([#46](https://github.com/SeedCompany/libs/issues/46)) ([9de2ac1](https://github.com/SeedCompany/libs/commit/9de2ac1fa7ebcf556c2268e9dd218777f2a178e5))

## [4.0.2](https://github.com/SeedCompany/libs/compare/email-4.0.1...email-4.0.2) (2024-11-16)


### Bug Fixes

* **email:** strict esm/type imports ([ed7ec9d](https://github.com/SeedCompany/libs/commit/ed7ec9db1640b791edb626a4b41f5e00ae7ee952))

## [4.0.1](https://github.com/SeedCompany/libs/compare/email-4.0.0...email-4.0.1) (2024-09-27)


### Bug Fixes

* **email:** render import ([c30e5a0](https://github.com/SeedCompany/libs/commit/c30e5a0036939e10a0f2965945f42e85b6b837e6))

## [4.0.0](https://github.com/SeedCompany/libs/compare/email-3.3.3...email-4.0.0) (2024-09-26)


### ⚠ BREAKING CHANGES

* **email:** ESM only & drop node 16-19

### Features

* **email:** bump deps ([3aef2de](https://github.com/SeedCompany/libs/commit/3aef2ded4198823112ce3c6cbf787db3f1297c38))


### Miscellaneous Chores

* **email:** esm only & node 20 ([0da1948](https://github.com/SeedCompany/libs/commit/0da19485ee4c8d7a80732254ac42c52a55db1c2b))

## [3.3.3](https://github.com/SeedCompany/libs/compare/email-3.3.2...email-3.3.3) (2024-04-18)


### Bug Fixes

* sourcemap paths ([#32](https://github.com/SeedCompany/libs/issues/32)) ([0d47cf4](https://github.com/SeedCompany/libs/commit/0d47cf47898fbe24f3adb8fdf4cb000b40f68a89))

## [3.3.2](https://github.com/SeedCompany/libs/compare/email-3.3.1...email-3.3.2) (2023-07-26)


### Bug Fixes

* **email:** attachment optional props ([f173951](https://github.com/SeedCompany/libs/commit/f173951123e6c1eb3d6b682f7f2211e5c83f15d3))

## [3.3.1](https://github.com/SeedCompany/libs/compare/email-3.3.0...email-3.3.1) (2023-07-20)


### Bug Fixes

* **email:** export require -> default ([04e73da](https://github.com/SeedCompany/libs/commit/04e73da1d83d71cd8c1bec4d893b586b9382201d))

## [3.3.0](https://github.com/SeedCompany/libs/compare/email-3.2.7...email-3.3.0) (2023-07-19)


### Features

* **email:** support NestJS v10 ([b19b60f](https://github.com/SeedCompany/libs/commit/b19b60f83cd8b621dddf3410d938481d234d90a0))

## [3.2.7](https://github.com/SeedCompany/libs/compare/email-3.2.6...email-3.2.7) (2023-07-19)


### Bug Fixes

* **email:** accidentally dropped DTS emission ([d5593ce](https://github.com/SeedCompany/libs/commit/d5593cea622bce9654c62f79cc699320ef92f82f))

## [3.2.6](https://github.com/SeedCompany/libs/compare/email-3.2.5...email-3.2.6) (2023-07-19)


### Bug Fixes

* **email:** drop ESM support ([#15](https://github.com/SeedCompany/libs/issues/15)) ([f6a36eb](https://github.com/SeedCompany/libs/commit/f6a36eb8f33d8d6ae17cf172f7b7d7a7c2b95639))

## [3.2.5](https://github.com/SeedCompany/libs/compare/email-3.2.4...email-3.2.5) (2023-07-14)


### Bug Fixes

* **email:** attempt to fix cjs import being interpreted as a reference to an esm js file ([4d333e6](https://github.com/SeedCompany/libs/commit/4d333e6ce8678700ad0f5390992f9cbfa0163e2d))

## [3.2.4](https://github.com/SeedCompany/libs/compare/email-3.2.3...email-3.2.4) (2023-07-14)


### Bug Fixes

* **email:** title context being lost ([533923e](https://github.com/SeedCompany/libs/commit/533923ed016e667af8463adea02233a32b50144b))

## [3.2.3](https://github.com/SeedCompany/libs/compare/email-3.2.2...email-3.2.3) (2023-07-14)


### Bug Fixes

* **email:** jsx compilation in built files ([5375f76](https://github.com/SeedCompany/libs/commit/5375f769542b74a33c962181cf9d8e8308e8a2d2))

## [3.2.2](https://github.com/SeedCompany/libs/compare/email-3.2.1...email-3.2.2) (2023-04-07)


### Bug Fixes

* **email:** restore templates/ path in exports ([df81703](https://github.com/SeedCompany/libs/commit/df81703972ed09592f231334de65aafe391e027d))

## [3.2.1](https://github.com/SeedCompany/libs/compare/email-3.2.0...email-3.2.1) (2023-04-07)


### Bug Fixes

* **email:** exported sub paths ([5da85ac](https://github.com/SeedCompany/libs/commit/5da85acecf842a35e8b096580ea65959191b3340))

## [3.2.0](https://github.com/SeedCompany/libs/compare/email-3.1.0...email-3.2.0) (2023-03-02)


### Features

* **email:** port email lib here ([#1](https://github.com/SeedCompany/libs/issues/1)) ([1a081a1](https://github.com/SeedCompany/libs/commit/1a081a1bb1448a79fd4b35a4c7e8920239be66fa))
