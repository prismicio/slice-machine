# Git: Not a Slice Machine repository

The Git repository was linked to a Prismic repository in Slice Machine, but the Git repository does not contain Slice Machine.

A `slicemachine.config.json` file is required to integrate a Git repository with Prismic.

## How to fix the issue

Add a Slice Machine configuration file to the Git repository.

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
