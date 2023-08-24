<p align="center">
  <a href="https://prismic.io/slice-machine">
    <img src="https://raw.githubusercontent.com/prismicio/slice-machine/master/.github/logo.svg" alt="Slice Machine logo" width="220" />
  </a>
</p>

# Slice Machine

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Conventional Commits][conventional-commits-src]][conventional-commits-href]
[![License][license-src]][license-href]

[Slice Machine][slice-machine] transforms the way you code reusable components and lets you deliver them directly to marketers in a custom page builder using [Prismic][prismic].

<!-- [![Codecov][codecov-src]][codecov-href] -->

- 🧰 &nbsp;Build [Slices][prismic-docs-slices] in a specialized development environment.
- 📄 &nbsp;Manage and configure your [custom types][prismic-docs-custom-types].
- ⚒️ &nbsp;Integrate into your website's framework using code generation.

## Install

We recommend installing Slice Machine into your project using `@slicemachine/init`:

```sh
npx @slicemachine/init@latest
```

If you want to install `slice-machine-ui` manually, you can do so like this:

```sh
npm install --save-dev slice-machine-ui
```

## Documentation

For full documentation, visit the [official Prismic documentation][prismic-docs-slice-machine].

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open a new topic][forum-question] on our community forum explaining what you want to achieve / your question. Our support team will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a PR][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

## License

```
   Copyright 2013-2023 Prismic <contact@prismic.io> (https://prismic.io)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

<!-- Links -->

[prismic]: https://prismic.io
[slice-machine]: https://prismic.io/slice-machine

<!-- TODO: Replace link with a more useful one if available -->

[prismic-docs]: https://prismic.io/docs
[prismic-docs-slice-machine]: https://prismic.io/docs/slice-machine
[prismic-docs-slices]: https://prismic.io/docs/slice
[prismic-docs-custom-types]: https://prismic.io/docs/custom-types
[changelog]: /CHANGELOG.md

<!-- TODO: Replace link with a more useful one if available -->

[forum-question]: https://community.prismic.io
[repo-bug-report]: https://github.com/prismicio/slice-machine/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio/slice-machine/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio/slice-machine/pulls

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/slice-machine-ui/latest.svg
[npm-version-href]: https://npmjs.com/package/slice-machine-ui
[npm-downloads-src]: https://img.shields.io/npm/dm/slice-machine-ui.svg
[npm-downloads-href]: https://npmjs.com/package/slice-machine-ui
[github-actions-ci-src]: https://github.com/prismicio/slice-machine/workflows/test/badge.svg
[github-actions-ci-href]: https://github.com/prismicio/slice-machine/actions?query=workflow%3Atest
[codecov-src]: https://img.shields.io/codecov/c/github/prismicio/slice-machine.svg
[codecov-href]: https://codecov.io/gh/prismicio/slice-machine
[conventional-commits-src]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-href]: https://conventionalcommits.org
[license-src]: https://img.shields.io/npm/l/slice-machine-ui.svg
[license-href]: https://npmjs.com/package/slice-machine-ui
