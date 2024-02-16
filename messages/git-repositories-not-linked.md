# Git: Repositories not linked

The Git repository and the Prismic repository configured in `slicemachine.config.json` are not linked.

The Prismic repository configured in `slicemachine.config.json` should match the Git repository linked in Slice Machine.

## How to fix the issue

Update the project's `slicemachine.config.json`'s `repositoryName` property with the correct Prismic repository.

A basic Slice Machine configuration file looks like this:

```jsonc
// slicemachine.config.json

{
  "repositoryName": "example-prismic-repo",
  "adapter": "@slicemachine/adapter-next",
  "libraries": ["./src/slices"],
  "localSliceSimulatorURL": "http://localhost:3000/slice-simulator"
}
```

If the Git repository should not interact with the Prismic GitHub app, disconnect the repository from within Slice Machine's Settings page.
