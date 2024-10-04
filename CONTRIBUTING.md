# Contributing

This package is primarily maintained by [Prismic](https://prismic.io)[^1]. External contributions are welcome. Ask for help by [opening an issue](https://github.com/prismicio/slice-machine/issues/new/choose), or request a review by opening a pull request.

## :gear: Setup

<!-- When applicable, list system requirements to work on the project. -->

The following setup is required to work on this project:

- Node.js
- npm CLI
- Yarn

## :memo: Project-specific notes

<!-- Share information about the repository. -->
<!-- What specific knowledge do contributors need? -->

> [!TIP]
> Please update this section with helpful notes for contributors.

#### "SM" Types

- Slice Machine contains Slice Machine-specific versions of some `@prismicio/types-internal` types. For example, Slice Machine's `GroupSM` is a modified version of `@prismicio/types-internal`'s `Group`.
- The "SM" types contain reshaped data that make it easy to perform Slice Machine-specific transformations. For example, `GroupSM` uses an array to define its fields while `Group` uses an object. The array makes it easy to change the order of fields.
- "SM" types have `fromSM` and `toSM` helpers to convert one data type into the other.
- The "SM" types will be removed at some point in the future to simplify cross-repository development.

#### Tests

##### Unit and integration with Vitest

- `slice-machine-ui` contains unit and integration tests. The integration tests have been superseded by Playwright tests and will likely be removed in the future. Unit tests can be written as needed.
- All other packages in the monorepo contain integration tests written using Vitest.

##### End-to-end with Playwright

See [playwright/README.md](./playwright/README.md) for details.

#### Sentry

- Sentry monitors errors in production.
- Check Sentry regularly for errors. Especially check Sentry after publishing new package versions.

## :construction_worker: Develop

> [!NOTE]
> It's highly recommended to discuss your changes with the Prismic team before starting by [opening an issue](https://github.com/prismicio/slice-machine/issues/new/choose).[^2]
>
> A short discussion can accelerate your work and ship it faster.

```sh
# Clone and prepare the project.
git clone git@github.com:prismicio/slice-machine.git
cd slice-machine
yarn install

# Create a new branch for your changes (e.g. lh/fix-win32-paths).
git checkout -b <your-initials>/<feature-or-fix-description>

# Start the development watcher.
# Run this command while you are working on your changes.
yarn run dev

# Build the project for production.
# Run this command when you want to see the production version.
yarn run build

# Lint your changes before requesting a review. No errors are allowed.
yarn run lint

# Format your changes before requesting a review. No errors are allowed.
yarn run prettier:check
# Errors can be fixed automatically:
yarn run prettier:fix

# Test your changes before requesting a review.
# All changes should be tested. No failing tests are allowed.
yarn run test
```

To start the development version of Slice Machine with a Prismic repository, use the `play` script.

`yarn play` requires the `yarn dev` script to be running in the background.

```sh
# Start the most recent playground or create one if none exist.
yarn play

# Start an existing playground or create one if it doesn't exist.
yarn play my-playground-name

# Force create a new playground
yarn play --new
yarn play --new my-playground-name

# Specify a framework (default: next)
yarn play -f sveltekit
yarn play --framework sveltekit

# If `-f` is passed with a playground name and the playground
# already exists, halt. If the playground does not exist, create
# a new one with that framework.
yarn play -f sveltekit my-playground-name

# Don't start the project
yarn play --no-start

# Dry run
yarn play -n
yarn play --dry-run
```

## :building_construction: Submit a pull request

> [!NOTE]
> Code will be reviewed by the Prismic team before merging.[^3]
>
> Request a review by opening a pull request.

```sh
# Open a pull request. This example uses the GitHub CLI.
gh pr create

# Someone from the Prismic team will review your work. This review will at
# least consider the PR's general direction, code style, and test coverage.

# When ready, PRs should be merged using the "Squash and merge" option.
```

## 🏗️ Local development with editor (slice-machine-ui)

In order to be able to develop faster locally, without having to publish new `editor-ui/fields/support` npm packages, you can use yalc (a local package repository). Here how to do it:

#### 1. Check `editor/CONTRIBUTING.md` "Local package publishing" section
#### 2. Link editor packages to yalc
```shell
yarn yalc:editor-packages link
```

#### _(after developing)_ Unlink to use the installed npm packages
```shell
yarn yalc:editor-packages clean
```

## :rocket: Publish

> [!CAUTION]
> Publishing is restricted to the Prismic team.[^4]

Use the [**Publish stable**](https://github.com/prismicio/slice-machine/actions/workflows/publish-stable.yml) GitHub Action to publish a new version of Slice Machine and its child packages.

Version increment types can be specified for each package using the action's workflow form. For example, you can choose to increment `slice-machine-ui` by a major, minor, or patch version. Select "decline" to skip incrementing the version.

The GitHub Action is powered by a purpose-built script: `script/publish.ts`.

[^1]: This package is maintained by the DevTools team. Prismic employees can ask for help or a review in the [#team-dev-tools](https://prismic-team.slack.com/archives/CPG31MDL1) Slack channel.
[^2]: Prismic employees are highly encouraged to discuss changes with the DevTools team in the [#team-dev-tools](https://prismic-team.slack.com/archives/CPG31MDL1) Slack channel before starting.
[^3]: Code should be reviewed by the DevTools team before merging. Prismic employees can request a review in the [#team-dev-tools](https://prismic-team.slack.com/archives/CPG31MDL1) Slack channel.
[^4]: Prismic employees can ask the DevTools team for [npm](https://www.npmjs.com) publish access.
