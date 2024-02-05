# Git: Invalid Slice Machine config

The Git repository's Slice Machine configuration file (`slicemachine.config.json`) was not valid.

Any of the following issues could cause this error:

- Missing required properties, such as `repositoryName` and `adapter`.
- Invalid values given to configuration properties.
- Invalid JSON with incorrect syntax.

## How to fix the issue

Update the project's Slice Machine configuration file, fixing any syntax errors or incorrect properties.

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
