# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.12](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.11...v0.0.12) (2023-02-28)


### Bug Fixes

* correctly detect TypeScript projects in "slice-simulator:setup:read" ([b74c42e](https://github.com/prismicio/slicemachine-adapter-next/commit/b74c42eb9c382370872794b125bf0518ca87e528))
* install `@prismicio/helpers` and `@prismicio/react` on `command:init` ([061e821](https://github.com/prismicio/slicemachine-adapter-next/commit/061e82148bb7677c8c0b4a4184f52f85fbb1a501))

### [0.0.11](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.10...v0.0.11) (2023-02-28)


### Features

* automatically detect TypeScript projects via presence of `tsconfig.json` ([589d70b](https://github.com/prismicio/slicemachine-adapter-next/commit/589d70bf2448e3385ad0b4f161cb185454d2ab80))

### [0.0.10](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.9...v0.0.10) (2023-02-28)


### Features

* add `command:init` support to install deps and generate boilerplate files ([8abd294](https://github.com/prismicio/slicemachine-adapter-next/commit/8abd2948cfc61e7dd7fd44a7d252f0e87307994e))
* add `lazyLoadSlices` option to use `next/dynamic` when loading Slices (`true` by default) ([f90e39d](https://github.com/prismicio/slicemachine-adapter-next/commit/f90e39d4e5c66b22669af72fdc8d823cf687bf46))


### Refactor

* remove reference to `@slicemachine/plugin-kit`'s `InstallDependenciesFunction` type ([249eb9b](https://github.com/prismicio/slicemachine-adapter-next/commit/249eb9b4fd9e0bfe885feffba31f632b7fb8668d))


### Chore

* **deps:** update dependencies ([e42c021](https://github.com/prismicio/slicemachine-adapter-next/commit/e42c0216442b5211b90cd301768d8e8fd990c0ae))

### [0.0.9](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.8...v0.0.9) (2023-01-11)


### Bug Fixes

* remove `state` prop from `SliceSimulator` (fixes infinite reloading issue) ([1b6b93f](https://github.com/prismicio/slicemachine-adapter-next/commit/1b6b93f8802fa45faa958f1ee9271ebcfa314819))


### Documentation

* fix `<SliceSimulator>` TSDocs example ([1385483](https://github.com/prismicio/slicemachine-adapter-next/commit/138548307bcf8f4d879e06b8523ddd40df9b4d66))

### [0.0.8](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.7...v0.0.8) (2023-01-10)


### Features

* move location of TypeScript content types to `./prismicio.d.ts` ([75f9933](https://github.com/prismicio/slicemachine-adapter-next/commit/75f9933f9378da5f5923854a572af1400555b788))

### [0.0.7](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.6...v0.0.7) (2023-01-10)


### Features

* update to latest standards ([4e6aed5](https://github.com/prismicio/slicemachine-adapter-next/commit/4e6aed51f655b7c636d711417079fa590efcc5d7))

### [0.0.6](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.5...v0.0.6) (2023-01-07)


### Bug Fixes

* replace `sm.json` with `slicemachine.config.json` ([1e803e4](https://github.com/prismicio/slicemachine-adapter-next/commit/1e803e40a42d19a21d24cdf0d16e254665c06854))


### Chore

* **deps:** update dependencies ([f97ca0d](https://github.com/prismicio/slicemachine-adapter-next/commit/f97ca0dd5f9d22ddf7c1f2d8ebdf217f7f870814))

### [0.0.5](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.4...v0.0.5) (2022-12-28)


### Features

* add descriptions to Slice Simulator set up steps ([d3f3ba6](https://github.com/prismicio/slicemachine-adapter-next/commit/d3f3ba600d2a064c10ffda4b40bbfd2417e7c233))


### Chore

* **deps:** update dependencies ([4c7e9fb](https://github.com/prismicio/slicemachine-adapter-next/commit/4c7e9fb235b80eabc08aa326523ec15067b4fc3a))

### [0.0.4](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.3...v0.0.4) (2022-12-16)


### Bug Fixes

* add `SliceSimulator` entry ([7189fde](https://github.com/prismicio/slicemachine-adapter-next/commit/7189fde2eee418714227abd46c2c2527c1db1f64))
* add non-editable banner to global types file ([4845c83](https://github.com/prismicio/slicemachine-adapter-next/commit/4845c83f0a801106727b3181b11af1b5ab5507fb))
* format snippets correctly ([cef719a](https://github.com/prismicio/slicemachine-adapter-next/commit/cef719a63d679e4b4a3f54acc861cea3eaf6328b))
* generate correct Slice Library index file ([4892c45](https://github.com/prismicio/slicemachine-adapter-next/commit/4892c45c15125b6f43d065b9391f19db064e6efb))
* use correct indentation in Slice Simulator set up steps ([c15f4b3](https://github.com/prismicio/slicemachine-adapter-next/commit/c15f4b314cd237da3b74dd0eb774ee970405f9fe))
* use Slice name as component name ([8c0195c](https://github.com/prismicio/slicemachine-adapter-next/commit/8c0195c684d7c9c4c2f3ea6958666fbf598229db))


### Refactor

* use `node-fetch` over `node:http` ([1834f43](https://github.com/prismicio/slicemachine-adapter-next/commit/1834f43a8c7f83abe5371c70861fb68837d1b580))


### Chore

* **deps:** update dependencies ([d7a07d0](https://github.com/prismicio/slicemachine-adapter-next/commit/d7a07d027ffa6e4ee338d0a5a0949eee28562b87))
* update `package-lock.json` ([332a1b7](https://github.com/prismicio/slicemachine-adapter-next/commit/332a1b732e95474bfea60fb3721a47628369d3e0))

### [0.0.3](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.2...v0.0.3) (2022-11-22)


### Features

* support `slice:rename` and `custom-type:rename` ([#3](https://github.com/prismicio/slicemachine-adapter-next/issues/3)) ([487c529](https://github.com/prismicio/slicemachine-adapter-next/commit/487c529bce48cfb08ac6a6513592d54b95b3a388))

### [0.0.2](https://github.com/prismicio/slicemachine-adapter-next/compare/v0.0.1...v0.0.2) (2022-11-09)


### Features

* add asset management hooks ([#2](https://github.com/prismicio/slicemachine-adapter-next/issues/2)) ([048decc](https://github.com/prismicio/slicemachine-adapter-next/commit/048decc6b52f06e256ff9c9e06f539ee92ed6023))
* generate global content types file ([#1](https://github.com/prismicio/slicemachine-adapter-next/issues/1)) ([32450b5](https://github.com/prismicio/slicemachine-adapter-next/commit/32450b5eeb8ee0a32d98c4dbc90c3181ecd44c0e))


### Bug Fixes

* update deps and fix builds ([d293d8f](https://github.com/prismicio/slicemachine-adapter-next/commit/d293d8f374a0fc4f084208ce8cf5350678264a1b))


### Chore

* fix TypeScript build error ([77da83a](https://github.com/prismicio/slicemachine-adapter-next/commit/77da83a754815b344f2a8025ce270623121cc7f7))
* support Next.js 13 ([d3ab288](https://github.com/prismicio/slicemachine-adapter-next/commit/d3ab288eb93050a908418f671fc2b4031f1c119b))
* update infrastructure ([030907e](https://github.com/prismicio/slicemachine-adapter-next/commit/030907e3017f3af7a57e58ae69fb94f9fa7fd5fb))
* use jsx transform ([451a0e4](https://github.com/prismicio/slicemachine-adapter-next/commit/451a0e439690c30a6821f7a808d181f6fae0fb3f))

### 0.0.1 (2022-07-10)


### Features

* init ([7519394](https://github.com/prismicio/slicemachine-adapter-next/commit/7519394b6686555faedccd9912db1adf19e03f1e))


### Refactor

* use `node:` prefix when using Node.js modules ([dd4ba12](https://github.com/prismicio/slicemachine-adapter-next/commit/dd4ba121ec5f7e50e3f886e525893d25adb8fd7b))


### Chore

* add `react` as a dev dependency ([ac71c3a](https://github.com/prismicio/slicemachine-adapter-next/commit/ac71c3a6ed87229ec2a72e5d89859be64c277364))
* add missing infrastructure ([359b5d7](https://github.com/prismicio/slicemachine-adapter-next/commit/359b5d72d829af9111b73b7bbe94cdf3ab197673))
* **deps:** maintain dependencies ([677570e](https://github.com/prismicio/slicemachine-adapter-next/commit/677570e2804cd93879eb3d48b332c6872e110cb9))
