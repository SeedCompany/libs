# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [2.0.0](https://github.com/SeedCompany/libs/compare/data-loader-1.0.1...data-loader-2.0.0) (2025-03-13)


### ⚠ BREAKING CHANGES

* **data-loader:** The guard and global getLoaderContextFromLifetimeId function have been removed.
These were really internal and shouldn't affect normal usage.

### Features

* **data-loader:** allow customizing lifetime id ([f8b43d2](https://github.com/SeedCompany/libs/commit/f8b43d2aa58105b68775916e64ac7c498376aabb))
* **data-loader:** declare support for Nest 11 ([c571a96](https://github.com/SeedCompany/libs/commit/c571a96d3ca6cd04d497c54a662a2f0286cf5d8c))


### Code Refactoring

* **data-loader:** inject context into decorator via pipe ([44efd34](https://github.com/SeedCompany/libs/commit/44efd343e2a445161540a267494d2b8a223d0d67))

## [1.0.1](https://github.com/SeedCompany/libs/compare/data-loader-1.0.0...data-loader-1.0.1) (2024-11-16)


### Bug Fixes

* **data-loader:** strict esm/type imports ([ac1c9f0](https://github.com/SeedCompany/libs/commit/ac1c9f0a0ee219c7706fb98e6b38412216910127))

## [0.6.0](https://github.com/SeedCompany/libs/compare/data-loader-0.5.4...data-loader-0.6.0) (2024-09-17)


### Features

* **data-loader:** pass loader context to loadMany ([#36](https://github.com/SeedCompany/libs/issues/36)) ([d7b2851](https://github.com/SeedCompany/libs/commit/d7b285162b4de5dcd419c9f72f8cba49b1ca6b7b))

## [0.5.4](https://github.com/SeedCompany/libs/compare/data-loader-0.5.3...data-loader-0.5.4) (2023-08-01)


### Bug Fixes

* **data-loader:** give up on graphql module optionality ([f0997e5](https://github.com/SeedCompany/libs/commit/f0997e50ed2d81bc7ff829e7c247e43481f747da))

## [0.5.3](https://github.com/SeedCompany/libs/compare/data-loader-0.5.2...data-loader-0.5.3) (2023-08-01)


### Bug Fixes

* **data-loader:** dont load gql module immediately ([219c1c5](https://github.com/SeedCompany/libs/commit/219c1c5f54a38e7ab73d1e1a5043f3193a1d3175))

## [0.5.2](https://github.com/SeedCompany/libs/compare/data-loader-0.5.1...data-loader-0.5.2) (2023-07-25)


### Bug Fixes

* **data-loader:** race condition with loading gql execution context for lifetime id ([49dedab](https://github.com/SeedCompany/libs/commit/49dedab93f56c7a692fbd750cb88e216f4bdadad))

## [0.5.1](https://github.com/SeedCompany/libs/compare/data-loader-0.5.0...data-loader-0.5.1) (2023-07-20)


### Bug Fixes

* **data-loader:** import of ExecutionContextHost for ESM ([35a3e6b](https://github.com/SeedCompany/libs/commit/35a3e6bbd406bef408e3f8b644097a59cfee32a7))

## [0.5.0](https://github.com/SeedCompany/libs/compare/data-loader-0.4.1...data-loader-0.5.0) (2023-07-19)


### Features

* **data-loader:** support NestJS v10 ([5d79554](https://github.com/SeedCompany/libs/commit/5d795549b27c8cfeccd8f05d7e2d515ede27e5d3))

## [0.4.1](https://github.com/SeedCompany/libs/compare/data-loader-0.4.0...data-loader-0.4.1) (2023-06-26)


### Bug Fixes

* **data-loader:** default to correct strategy name ([462c68f](https://github.com/SeedCompany/libs/commit/462c68ffb1525b4de3bda66d006d02fd176c6484))

## [0.4.0](https://github.com/SeedCompany/libs/compare/data-loader-0.3.0...data-loader-0.4.0) (2023-04-29)


### Features

* **data-loader:** add typeName to createError args ([6a1bf5f](https://github.com/SeedCompany/libs/commit/6a1bf5f5805fc6bb3e31926c93080f935d142328))

## [0.3.0](https://github.com/SeedCompany/libs/compare/data-loader-0.2.2...data-loader-0.3.0) (2023-04-29)


### Features

* **data-loader:** expose loaders from lifetime object ([95baa30](https://github.com/SeedCompany/libs/commit/95baa30e3ccf7a6436335b25c38f67e23e4336a0))

## [0.2.2](https://github.com/SeedCompany/libs/compare/data-loader-0.2.1...data-loader-0.2.2) (2023-04-07)


### Bug Fixes

* **data-loader:** common version constraint ([1202670](https://github.com/SeedCompany/libs/commit/12026709529bc3f8efb86fc801a3e4f20b042200))

## [0.2.1](https://github.com/SeedCompany/libs/compare/data-loader-0.2.0...data-loader-0.2.1) (2023-03-24)


### Bug Fixes

* **data-loader:** bump to release build fix ([e293d39](https://github.com/SeedCompany/libs/commit/e293d39efdafb7eba61ef6eefb8cdc313f9ff159))

## [0.2.0](https://github.com/SeedCompany/libs/compare/data-loader-0.1.1...data-loader-0.2.0) (2023-03-23)


### Features

* **data-loader:** add `DataLoaderContext.getLoader` shortcut ([#11](https://github.com/SeedCompany/libs/issues/11)) ([7eee8db](https://github.com/SeedCompany/libs/commit/7eee8db11a899667a26569702d6575cb38a142f8))

## [0.1.1](https://github.com/SeedCompany/libs/compare/data-loader-0.1.0...data-loader-0.1.1) (2023-03-21)


### Bug Fixes

* **data-loader:** common dependency version ([#9](https://github.com/SeedCompany/libs/issues/9)) ([755916b](https://github.com/SeedCompany/libs/commit/755916b898ea209b48856fff000b58808659c39a))

## 0.1.0 (2023-03-17)


### Features

* **data-loader:** init lib ([3bb202d](https://github.com/SeedCompany/libs/commit/3bb202d2226520bda7a19e76ff70378db023e85b))
* **data-loader:** port & refactor from cord-api ([ff077c4](https://github.com/SeedCompany/libs/commit/ff077c4a174809a0717965e524b9ecdc11e4ac64))
