# Releasing

## From the CLI

First, ensure you have:

1. Publish access to the `prismic` organization and to the `prismic` package.
2. Read access to the `SENTRY_AUTH_TOKEN` secret.

Then, if you have access, the steps below explain how to publish packages:

1. Run `git checkout <branch>` to switch to the branch you want to release.
2. Run `git pull` to update the current branch.
3. Run `yarn` to install the project dependencies.
4. Run `yarn clean`, from the top-level directory, to clean the working tree.
5. Run `yarn npm login` to log in to the npm registry.
6. Run `export SENTRY_AUTH_TOKEN=<SENTRY_AUTH_TOKEN>` to add the `SENTRY_AUTH_TOKEN`
   variable to the environment of all subsequently executed commands.
7. To publish:
   - A stable release, run `yarn publish stable --dry-run <name>:(major|minor|patch) ...`, from the top-level directory.
   - An unstable release, run `yarn publish unstable --dry-run`, from the top-level directory.
8. This was a dry run. If everything looks good, you can re-run the same command
   without the `--dry-run` flag.

Finally, if the release succeeded, you should:

1. Write/Publish the [release notes](https://github.com/prismicio/devtools/releases)
   on GitHub.
2. Move all [Linear issues](https://linear.app/prismic/team/DT/all) in _Release → Pending_
   to _Release → Done_.
