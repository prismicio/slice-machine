# SliceMachine Slices Builder

This package is meant to be installed as development dependency of any SliceMachine project. It should work with both Nuxt and Next projects.

To help development, folder `tests/project` contains an up-to-date SliceMachine project.
To run the builder locally:

```bash
yarn install;
yarn run dev-server # points to tests/project and starts server
# then in another shell window:
yarn dev
````

Stack:

- Next.js (UI)
- Express (Server)
- Theme-ui ( see `src/theme.js`)
- Formik (forms)
