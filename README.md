<p align="center">
  <a href="https://slicemachine.dev">
    <img src=".github/logo.svg" alt="Slice Machine logo" width="220" />
  </a>
</p>
<p align="center">
  Develop and work with <a href="https://prismic.io">Prismic</a> Slices, locally.
</p>

# Slice Machine

[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![npm version][npm-version-src]][npm-version-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![License][license-src]][license-href]

<!-- [![Codecov][codecov-src]][codecov-href] -->

## Quickstart

For the smoothest onboarding experience, go to [Prismic][prismic-dashboard], create an account, create a new repository, and choose a starter project. You will be guided through a full introduction to Slice Machine.

If you want to dive in without any guidance, follow these steps:

Create a Next.js or Nuxt app:
```
npx create-next-app@latest my-app
```
```
npx nuxi@latest init my-app
```

Open the folder:
```
cd my-app
```
Install dependencies:
```
npm i
```

Init Slice Machine:
```
npx @slicemachine/init
```

Open two terminals. In one terminal, run the web app:

```
npm run dev
```

In the other, run Slice Machine:
```
npm run slicemachine
```
Now you can use Slice Machine to create content models for your website. You will push your models to Prismic, where editors can use them to create content.

You will need to query content from the Prismic API to use it in your application. To learn how to use the Prismic API, visit the [Prismic Documentation][prismic-docs].

## Documentation

To discover what's new on this package check out the [changelog][changelog]. For full documentation, visit the official [Prismic documentation][sm-docs].

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open a new topic][forum-question] on our community forum explaining what you want to achieve / your question. Our support team will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a PR][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

## License

```
Copyright 2013-2024 Prismic <contact@prismic.io> (https://prismic.io)

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

<!-- TODO: Replace link with a more useful one if available -->

[prismic-docs]: https://prismic.io/docs
[sm-docs]: https://prismic.io/docs/slice-machine
[prismic-dashboard]: https://prismic.io/dashboard
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
