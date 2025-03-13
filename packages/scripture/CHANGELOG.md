# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [0.7.0](https://github.com/SeedCompany/libs/compare/scripture-0.6.0...scripture-0.7.0) (2025-03-13)


### Features

* **scripture:** add book is testament getters ([c11595f](https://github.com/SeedCompany/libs/commit/c11595f03b8388da4c40d48e8537e8630dfa9ba7))

## [0.6.0](https://github.com/SeedCompany/libs/compare/scripture-0.5.0...scripture-0.6.0) (2025-03-13)


### Features

* **scripture:** strict book name strings ([512ce10](https://github.com/SeedCompany/libs/commit/512ce10f1f30a6008106b273d56c283d8441b7a8))

## [0.5.0](https://github.com/SeedCompany/libs/compare/scripture-0.4.0...scripture-0.5.0) (2025-03-13)


### Features

* **scripture:** add testament/full bible range getters ([a5f95cf](https://github.com/SeedCompany/libs/commit/a5f95cfba1ea57a0d5cbfbbb1dd388d940a47d04))

## [0.4.0](https://github.com/SeedCompany/libs/compare/scripture-0.3.3...scripture-0.4.0) (2025-03-13)


### Features

* **scripture:** declared toStringTags for Book/Chapter/Verse ([0f99a79](https://github.com/SeedCompany/libs/commit/0f99a79919695b79776d7f363afeb7a4dc9e3bab))

## [0.3.3](https://github.com/SeedCompany/libs/compare/scripture-0.3.2...scripture-0.3.3) (2024-11-16)


### Bug Fixes

* **scripture:** strict esm/type imports ([8247c5f](https://github.com/SeedCompany/libs/commit/8247c5f5c39193a6a200b105e43fdba83cb892ae))

## [0.3.2](https://github.com/SeedCompany/libs/compare/scripture-0.3.1...scripture-0.3.2) (2024-04-18)


### Bug Fixes

* sourcemap paths ([#32](https://github.com/SeedCompany/libs/issues/32)) ([0d47cf4](https://github.com/SeedCompany/libs/commit/0d47cf47898fbe24f3adb8fdf4cb000b40f68a89))

## [0.3.1](https://github.com/SeedCompany/libs/compare/scripture-0.3.0...scripture-0.3.1) (2024-01-08)


### Bug Fixes

* **scripture:** merging ranges with the same endpoint ([#29](https://github.com/SeedCompany/libs/issues/29)) ([26169b6](https://github.com/SeedCompany/libs/commit/26169b62b92b4b346164af306bc3ee0aafdcb5ec))

## [0.3.0](https://github.com/SeedCompany/libs/compare/scripture-0.2.0...scripture-0.3.0) (2023-08-03)


### Features

* **scripture:** handle "&" separators when parsing scripture ([cbf62ae](https://github.com/SeedCompany/libs/commit/cbf62ae3ef908cb2be278c4e8f1993f1cec8c31d))
* **scripture:** handle 1st 2nd 3rd forms of book names ([fb13579](https://github.com/SeedCompany/libs/commit/fb13579488639064cf9f0ffda1ad4aadb0c9fefe))

## [0.2.0](https://github.com/SeedCompany/libs/compare/scripture-0.1.2...scripture-0.2.0) (2023-07-06)


### Features

* **scripture:** change Psalms to be plural canonically ([3bf0f68](https://github.com/SeedCompany/libs/commit/3bf0f68fdb98b3f3d47aa4bb7422f6fbdcb4d362))

## [0.1.2](https://github.com/SeedCompany/libs/compare/scripture-0.1.1...scripture-0.1.2) (2023-05-05)


### Bug Fixes

* **scripture:** transpile es2020 ([f09a822](https://github.com/SeedCompany/libs/commit/f09a82221ffe092d4ab66455789f67f3b64f5e15))

## [0.1.1](https://github.com/SeedCompany/libs/compare/scripture-0.1.0...scripture-0.1.1) (2023-05-04)


### Bug Fixes

* **scripture:** tweak changelog and re-trigger npm deployment ([8e5952c](https://github.com/SeedCompany/libs/commit/8e5952c57a932dd4dd90d8fc21f25ba880e7ba5e))

## 0.1.0 (2023-05-04)


### Features

* init library ([e75c150](https://github.com/SeedCompany/libs/commit/e75c15095f8e199b8624390e7792e935e62f529c))
* `Book.at/atMaybe` helper to create from relative index ([c1fbf88](https://github.com/SeedCompany/libs/commit/c1fbf88dc5dd0c8fed0c8467002101fec608c890))
* add JSON conversion for Book & Chapter ([98cf94a](https://github.com/SeedCompany/libs/commit/98cf94ac3237e980b76cfdfa54d8d7ac0361b35d))
* add maybe/nullable variants for getting chapters/verses ([ff4952e](https://github.com/SeedCompany/libs/commit/ff4952ed02e33ef0decda27fcbe7888cbfad354f))
* add primitive conversion based on new symbol with type hints ([ffa6508](https://github.com/SeedCompany/libs/commit/ffa65083424a173e9784c3b12e2fd58fb897a7a3))
* add some range helpers `to` & `full` ([4a10ae5](https://github.com/SeedCompany/libs/commit/4a10ae511ad5b02caa53881ca7187ade9d94dac4))
* add Verse.from to convert a verse like reference to a verse object ([084723c](https://github.com/SeedCompany/libs/commit/084723c6a4695dc56dd3fb3aa8edb7cc3273c231))
* allow relative indexes for chapter/verse lookups just like `Book.at` ([aadd5d2](https://github.com/SeedCompany/libs/commit/aadd5d2fd6eb8417b24d37afacc97377da5aafaa))
* port book, chapter, verse objects & raw data from cord ([08bb767](https://github.com/SeedCompany/libs/commit/08bb7673c30dcb222190945e6210976082eeec7a))
* port labeling logic from cord ([dbde416](https://github.com/SeedCompany/libs/commit/dbde416563e31ab9969ecc459f4831c4f9186a4d))
* port merging verse logic from cord ([b9b56fd](https://github.com/SeedCompany/libs/commit/b9b56fd342e597d48a749d099cf3e19a799c444a))
* port scripture parser from cord ([95fd2f7](https://github.com/SeedCompany/libs/commit/95fd2f7396ea7a318e17ae2483c6f770dcfb7fe1))
* port splitting verse range by book from cord ([028bc5c](https://github.com/SeedCompany/libs/commit/028bc5cdcdc55ab06a992435577c85e5ec42d3c5))
* put book name and chapter data straight on `Book` ([56ac5a3](https://github.com/SeedCompany/libs/commit/56ac5a360270d995671c231e340b623c37010c59))
