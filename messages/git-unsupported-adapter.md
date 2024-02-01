# Git: Unsupported adapter

The Slice Machine project uses an adapter that is not supported in the GitHub app.

The following adapters are supported:

- [`@slicemachine/adapter-next`](https://github.com/prismicio/slice-machine/tree/main/packages/adapter-next#readme): Next.js projects
- [`@slicemachine/adapter-nuxt`](https://github.com/prismicio/slice-machine/tree/main/packages/adapter-nuxt#readme): Nuxt projects
- [`@slicemachine/adapter-sveltekit`](https://github.com/prismicio/slice-machine/tree/main/packages/adapter-sveltekit#readme): SvelteKit projects

### How to fix the issue

Use a supported adapter.

You can verify which adapter your project uses by checking the `adapter` property in your project's `slicemachine.config.json`.

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

If you would like us to support your adapter, please [open a feature request](https://github.com/prismicio/slice-machine/issues/new/choose).
