# Contributing

This package is primarily maintained by [Prismic](https://prismic.io)[^1]. External contributions are welcome. Ask for help by [opening an issue](https://github.com/prismicio/devtools/issues/new/choose), or request a review by opening a pull request.

## :gear: Setup

The following setup is required to work on this project:

- Node.js
- npm CLI
- Yarn

## :construction_worker: Develop

```sh
# Clone and prepare the project.
git clone git@github.com:prismicio/devtools.git
cd devtools
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

# Errors can be fixed automatically.
yarn run prettier:fix

# Test your changes before requesting a review.
# All changes should be tested. No failing tests are allowed.
yarn run test
```

## :building_construction: Submit a pull request

> [!NOTE]
> Code will be reviewed by the Prismic team before merging.[^1]
>
> Request a review by opening a pull request.

```sh
# Open a pull request. This example uses the GitHub CLI.
gh pr create

# Someone from the Prismic team will review your work. This review will at
# least consider the PR's general direction, code style, and test coverage.

# When ready, PRs should be merged using the "Squash and merge" option.
```

## :rocket: Publish

> [!CAUTION]
> Publishing is restricted to the Prismic team.[^4]

Use the [**Publish stable**](https://github.com/prismicio/devtools/actions/workflows/publish-stable.yml) GitHub Action to publish a new version of dev tools packages.

Version increment types can be specified for each package using the action's workflow form. For example, you can choose to increment `prismic` by a major, minor, or patch version. Select "decline" to skip incrementing the version.

The GitHub Action is powered by a purpose-built script: `script/publish.ts`.

[^1]: This package is maintained by the DevTools team. Prismic employees can ask for help or a review in the [#team-dev-tools](https://prismic-team.slack.com/archives/CPG31MDL1) Slack channel.
