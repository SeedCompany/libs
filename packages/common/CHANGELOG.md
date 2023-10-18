# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [0.12.1](https://github.com/SeedCompany/libs/compare/common-0.12.0...common-0.12.1) (2023-10-18)


### Bug Fixes

* **common:** entries: associate types for key/value pairs ([edf32ac](https://github.com/SeedCompany/libs/commit/edf32aceaaddc42ac63277557dfed8f621dcd366))

## [0.12.0](https://github.com/SeedCompany/libs/compare/common-0.11.0...common-0.12.0) (2023-10-17)


### Features

* **common:** csv ([66f11a0](https://github.com/SeedCompany/libs/commit/66f11a07027770ec4ad4ed691766affa4d81b7e0))
* **common:** entries (of Records/Maps) ([#23](https://github.com/SeedCompany/libs/issues/23)) ([c1a437d](https://github.com/SeedCompany/libs/commit/c1a437d3ce135a5d8d1e1d567f070ee332705e87))
* **common:** forward json generics ([e87c6dd](https://github.com/SeedCompany/libs/commit/e87c6dde626ce3868ec97e749bd8cd3723a0787b))
* **common:** groupBy / groupToMapBy ([#22](https://github.com/SeedCompany/libs/issues/22)) ([2b36420](https://github.com/SeedCompany/libs/commit/2b36420cdde7589fff1c62a65e011f3cda030b42))
* **common:** isNotFalsy, isNotNil ([e1fb914](https://github.com/SeedCompany/libs/commit/e1fb91487b42a24bb0d2f6c66fa2f1b3fd0d3dd8))
* **common:** mapEntries, mapKeys, mapValues ([#26](https://github.com/SeedCompany/libs/issues/26)) ([48f58cf](https://github.com/SeedCompany/libs/commit/48f58cffdd72adb858952ce839f50d172f24c894))
* **common:** mapOf ([#24](https://github.com/SeedCompany/libs/issues/24)) ([2f1e479](https://github.com/SeedCompany/libs/commit/2f1e479961a2d14ca9cf244cc902da00972ca06c))
* **common:** mark setOf as const generic ([b7278a1](https://github.com/SeedCompany/libs/commit/b7278a1003a3f0097c729f94f5a5d9956e500e1f))
* **common:** simpleSwitch ([e156b6a](https://github.com/SeedCompany/libs/commit/e156b6a02c8d3c6b829bc4945811fde512621578))
* **common:** sortBy / cmpBy ([#21](https://github.com/SeedCompany/libs/issues/21)) ([a5b5e8a](https://github.com/SeedCompany/libs/commit/a5b5e8a9f3501237009f1a71ef58408fe9aacd04))

## [0.11.0](https://github.com/SeedCompany/libs/compare/common-0.10.0...common-0.11.0) (2023-09-05)


### Features

* **common:** allow CachedByArg to work with no args ([7365017](https://github.com/SeedCompany/libs/commit/7365017a62314fc44f79f5dd62ef225f85c8e7eb))

## [0.10.0](https://github.com/SeedCompany/libs/compare/common-0.9.0...common-0.10.0) (2023-04-29)


### Features

* **common:** setOf to create readonly set ([6a8660b](https://github.com/SeedCompany/libs/commit/6a8660be20f41ae4adcaf784bc375cbc8aeae3f5))

## [0.9.0](https://github.com/SeedCompany/libs/compare/common-0.8.2...common-0.9.0) (2023-04-11)


### Features

* **common:** add cleanJoin helper ([7ca8341](https://github.com/SeedCompany/libs/commit/7ca8341e41d8da68e58cc67184651fb516a8155f))

## [0.8.2](https://github.com/SeedCompany/libs/compare/common-0.8.1...common-0.8.2) (2023-04-10)


### Bug Fixes

* **common:** type on setHas ([07b04b1](https://github.com/SeedCompany/libs/commit/07b04b19724394e57abeb56a29bc61a3ab7f0531))

## [0.8.1](https://github.com/SeedCompany/libs/compare/common-0.8.0...common-0.8.1) (2023-04-10)


### Bug Fixes

* **common:** missing export for setHas ([6b58fbc](https://github.com/SeedCompany/libs/commit/6b58fbcdaf9606d0dfb211d8bf70a59d7ef3be77))

## [0.8.0](https://github.com/SeedCompany/libs/compare/common-0.7.0...common-0.8.0) (2023-04-10)


### Features

* **common:** add setHas helper along with WidenLiteral ([14295a0](https://github.com/SeedCompany/libs/commit/14295a09adaf20d7e8bf2ee21ef82fb30e1fd3c9))

## [0.7.0](https://github.com/SeedCompany/libs/compare/common-0.6.9...common-0.7.0) (2023-04-10)


### Features

* **common:** trigger release ([0d880f5](https://github.com/SeedCompany/libs/commit/0d880f569cad65e7979db77ba99ad1eb5adc112f))

## [0.5.0](https://github.com/SeedCompany/libs/compare/common-0.4.0...common-0.5.0) (2023-04-07)


### Features

* **common:** add FnLike & UnknownFn type helpers ([d9196bf](https://github.com/SeedCompany/libs/commit/d9196bf008b855cb1be8d0b4c5cb97e2fe5f7542))

## [0.4.0](https://github.com/SeedCompany/libs/compare/common-0.3.0...common-0.4.0) (2023-03-25)


### Features

* **common:** add `IterableItem` type helper ([be0ebf7](https://github.com/SeedCompany/libs/commit/be0ebf7f27ea43b09bf97eef6a01fbe59261dc61))

## [0.3.0](https://github.com/SeedCompany/libs/compare/common-0.2.0...common-0.3.0) (2023-03-20)


### Features

* **common:** add Luxon `Duration` custom inspection ([dd43890](https://github.com/SeedCompany/libs/commit/dd438904246e4dbba861ffda2185c37277ca886e))
* **common:** add optional Luxon `Duration.from` addition ([135cbe8](https://github.com/SeedCompany/libs/commit/135cbe8ae89960eec7eadaf6bcace2faff01d7e3))
* **common:** add overload to delay function when luxon duration patches are applied ([34d87de](https://github.com/SeedCompany/libs/commit/34d87dec7aea9f66c769e6f0d9e2d746ca9d13ba))
* **common:** add parseHumanToDurationLike function ([6354476](https://github.com/SeedCompany/libs/commit/63544767401d14a19e9ab4e6439b8620fa4c1d26))

## [0.2.0](https://github.com/SeedCompany/libs/compare/common-0.1.0...common-0.2.0) (2023-03-17)


### Features

* **common:** add ArrayItem type helper ([1554fda](https://github.com/SeedCompany/libs/commit/1554fda160f62cdf5bab7c0a3335a0d61095de9d))
* **common:** add asyncIteratorToArray function ([dcee54f](https://github.com/SeedCompany/libs/commit/dcee54f968875d5ec5a34f3108be622a83919c05))
* **common:** add asyncPool function ([67470cd](https://github.com/SeedCompany/libs/commit/67470cd840fe77b415a9d249a16c5d92121a063f))
* **common:** add bufferFromStream function ([ea52273](https://github.com/SeedCompany/libs/commit/ea52273a52764299a4d8e5fc2948aa99f7e452da))
* **common:** add delay function ([33e54de](https://github.com/SeedCompany/libs/commit/33e54dec2320db183e213992928f19ef1cd21a89))
* **common:** add nonEnumerable function ([d8bd5a5](https://github.com/SeedCompany/libs/commit/d8bd5a502a818007f5e98827a6e131f30bf0eba3))

## 0.1.0 (2023-03-04)


### Features

* **common:** add many & some type helpers ([b2ae1b5](https://github.com/SeedCompany/libs/commit/b2ae1b5cf03b5bae643b3f79ba4209d0a8c506a3))
* **common:** init lib ([8d44829](https://github.com/SeedCompany/libs/commit/8d44829cac6bc53d1180470e915a5fc107acead2))
* **common:** several cache helpers ([6f0f89d](https://github.com/SeedCompany/libs/commit/6f0f89d7a0a025b0b05b3e07f36d72d256c3dccc))
