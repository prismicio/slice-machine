# Git integration

Slice Machine allows developers to link a Prismic repository to a hosted Git repository. Linking repositories enables developer workflow features, like automatically pushing content models to Prismic upon pushing to the Git repository.

Today, GitHub is supported, with plans to support other Git providers in the future.

## Backend

The Git integration requires private API endpoints. See the [`prismicio/sm-api`](https://github.com/prismicio/sm-api) repository for details.

## GitHub support

Prismic has two GitHub apps to support the integration, both under the `prismicio` organization:

- **Production**: [Prismic.io][https://github.com/organizations/prismicio/settings/apps/prismic-io]
- **Staging**: [Prismic.io (Staging)][https://github.com/organizations/prismicio/settings/apps/prismic-io-staging]

Slice Machine will switch to the correct app automatically based on the `SM_ENV` variable.

In addition to the above apps, Slice Machine developers can use a user-specific app by setting `SM_ENV=development` and a `GITHUB_APP_SLUG` environment variable with the app's slug. Manually setting a development GitHub app is useful when developing the Git integration's API endpoints.
