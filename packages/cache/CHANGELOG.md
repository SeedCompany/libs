# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [4.0.1](https://github.com/SeedCompany/libs/compare/cache-4.0.0...cache-4.0.1) (2025-10-08)


### Bug Fixes

* **common:** upgrade luxon types & fix duration augment ([67667b1](https://github.com/SeedCompany/libs/commit/67667b1b5df42a664bb846cdca25d45f6ef6f747))

## [4.0.0](https://github.com/SeedCompany/libs/compare/cache-3.1.0...cache-4.0.0) (2025-10-03)


### ⚠ BREAKING CHANGES

* **cache:** drops support for TS 5.8-

### Features

* **cache:** type-fest v5 ([a01eda5](https://github.com/SeedCompany/libs/commit/a01eda5b6b12b7aa015f416ae06bd93061be3573))

## [3.1.0](https://github.com/SeedCompany/libs/compare/cache-3.0.2...cache-3.1.0) (2025-04-30)


### Features

* **cache:** allow reflect-metadata 0.2 ([15f1937](https://github.com/SeedCompany/libs/commit/15f1937082d0a5aaf7e826888c72c39b25624416))

## [3.0.2](https://github.com/SeedCompany/libs/compare/cache-3.0.1...cache-3.0.2) (2025-03-13)


### Bug Fixes

* **cache:** declare types field in package.json for JetBrains ([0383116](https://github.com/SeedCompany/libs/commit/0383116fa28a9ace07a26d3beecd1950fab0e748))

## [3.0.1](https://github.com/SeedCompany/libs/compare/cache-3.0.0...cache-3.0.1) (2025-03-13)


### Bug Fixes

* **cache:** accidentally dropped support for nest 10 ([db34bc1](https://github.com/SeedCompany/libs/commit/db34bc11d415c062c68f359245f490b54457e905))

## [3.0.0](https://github.com/SeedCompany/libs/compare/cache-2.0.1...cache-3.0.0) (2025-03-13)


### ⚠ BREAKING CHANGES

* **cache:** Drop support for keyv 4 & cache-manager 5

### Features

* **cache:** nest 11 / keyv 5 / cache-manager 6 ([#47](https://github.com/SeedCompany/libs/issues/47)) ([5531e00](https://github.com/SeedCompany/libs/commit/5531e00f59a271b05c128e6213654d04734591f2))

## [2.0.1](https://github.com/SeedCompany/libs/compare/cache-2.0.0...cache-2.0.1) (2024-11-16)


### Bug Fixes

* **cache:** strict esm/type imports ([133a196](https://github.com/SeedCompany/libs/commit/133a196150caa51efe930041180869feb79715e2))

## [1.1.0](https://github.com/SeedCompany/libs/compare/cache-1.0.0...cache-1.1.0) (2024-09-23)


### Features

* **cache:** allow default options at service level ([2a60fb2](https://github.com/SeedCompany/libs/commit/2a60fb286811729a919b409a78b06e8bdfa47bac))

## [1.0.0](https://github.com/SeedCompany/libs/compare/cache-0.3.1...cache-1.0.0) (2024-09-20)


### ⚠ BREAKING CHANGES

* **cache:** removed support for lru-cache v8

### Features

* **cache:** bump lru-cache & type-fest ([cc94db3](https://github.com/SeedCompany/libs/commit/cc94db39eb43ab242f06102d6fa62ea698c16366))

## [0.3.1](https://github.com/SeedCompany/libs/compare/cache-0.3.0...cache-0.3.1) (2024-04-18)


### Bug Fixes

* sourcemap paths ([#32](https://github.com/SeedCompany/libs/issues/32)) ([0d47cf4](https://github.com/SeedCompany/libs/commit/0d47cf47898fbe24f3adb8fdf4cb000b40f68a89))

## [0.3.0](https://github.com/SeedCompany/libs/compare/cache-0.2.0...cache-0.3.0) (2023-07-19)


### Features

* **cache:** support NestJS v10 ([fa41353](https://github.com/SeedCompany/libs/commit/fa4135393fd13b2b2676d5a20f909e4880443b6e))

## [0.2.0](https://github.com/SeedCompany/libs/compare/cache-0.1.9...cache-0.2.0) (2023-04-07)


### Features

* **cache:** parse ttl once where possible ([e8948c5](https://github.com/SeedCompany/libs/commit/e8948c5deff8e1d1306b0b7e2634c8040ad72db4))

## [0.1.9](https://github.com/SeedCompany/libs/compare/cache-0.1.8...cache-0.1.9) (2023-04-07)


### Bug Fixes

* **cache:** restore exports and declare stores with wildcard ([3686740](https://github.com/SeedCompany/libs/commit/3686740ed4cafb23579a055a017460c7d1e54534))

## [0.1.8](https://github.com/SeedCompany/libs/compare/cache-0.1.7...cache-0.1.8) (2023-04-07)


### Bug Fixes

* **cache:** try removing exports so node will import sub-paths ([24db538](https://github.com/SeedCompany/libs/commit/24db538b6d70475b296e4f46b7c6d1f9c1da6638))

## [0.1.7](https://github.com/SeedCompany/libs/compare/cache-0.1.6...cache-0.1.7) (2023-04-07)


### Bug Fixes

* **cache:** files filter since we are our cwd is dist now ([eb4cb7a](https://github.com/SeedCompany/libs/commit/eb4cb7ac6569de5fca23999c2ed6cc6ac68a5895))

## [0.1.6](https://github.com/SeedCompany/libs/compare/cache-0.1.5...cache-0.1.6) (2023-04-07)

## [0.1.5](https://github.com/SeedCompany/libs/compare/cache-0.1.4...cache-0.1.5) (2023-04-07)


### Bug Fixes

* **cache:** move copy command to nx. suffix with "#" to workaround excessive interpolation by nx ([fd20f24](https://github.com/SeedCompany/libs/commit/fd20f2441b5bc73f80aae5adf1b3cd119970d499))

## [0.1.4](https://github.com/SeedCompany/libs/compare/cache-0.1.3...cache-0.1.4) (2023-04-07)


### Bug Fixes

* **cache:** fix target name reference ([0ffb972](https://github.com/SeedCompany/libs/commit/0ffb972a6c4b5d9d8a63e67f2b835048265a6fcf))

## [0.1.3](https://github.com/SeedCompany/libs/compare/cache-0.1.2...cache-0.1.3) (2023-04-07)


### Bug Fixes

* **cache:** when assets are copied to dist ([de26dce](https://github.com/SeedCompany/libs/commit/de26dcea535d39432b994b9381180c528a31213e))

## [0.1.2](https://github.com/SeedCompany/libs/compare/cache-0.1.1...cache-0.1.2) (2023-04-07)


### Bug Fixes

* **cache:** try another sub-path export ([aeda970](https://github.com/SeedCompany/libs/commit/aeda97009d0f98d2247648042cb6f5de98a049a1))

## [0.1.1](https://github.com/SeedCompany/libs/compare/cache-0.1.0...cache-0.1.1) (2023-04-07)


### Bug Fixes

* **cache:** stores sub-path export ([d581c13](https://github.com/SeedCompany/libs/commit/d581c13ad77f933847a424d20d074c5eafeb9bef))

## 0.1.0 (2023-04-07)


### Features

* **cache:** init lib ([febf763](https://github.com/SeedCompany/libs/commit/febf7635202fe204e58b8a33d5e1c0ca1990cd4f))
* **cache:** port code from cord ([dd7386f](https://github.com/SeedCompany/libs/commit/dd7386fa456f94d60cdf03623e39acf66e9a3594))
