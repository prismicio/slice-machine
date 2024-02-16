# Git: Missing Slice Machine config

The Git repository was missing a Slice Machine configuration file (`slicemachine.config.json`)

## How to fix the issue

Add a `slicemachine.config.json` file to the Git repository.

A basic Slice Machine configuration file looks like this:

```json
// slicemachine.config.json

{
  "repositoryName": "example-prismic-repo",
  "adapter": "@slicemachine/adapter-next",
  "libraries": ["./src/slices"],
  "localSliceSimulatorURL": "http://localhost:3000/slice-simulator"
}
```

If the Git repository should not interact with the Prismic GitHub app, disconnect the repository from within Slice Machine's Settings page.
