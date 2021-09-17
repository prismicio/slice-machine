# SliceMachine Slices Builder

This package is meant to be installed as development dependency of any SliceMachine project. It should work with both Nuxt and Next projects.

To help development, the folder `tests/project` contains an up-to-date SliceMachine project.  
:information_source: To push your custom type / slices to your own repos, just change the API endpoint in `tests/project/sm.json`

To run the builder locally:

```bash
yarn install;
yarn run dev-server # points to tests/project and starts server
# then in another shell window:
yarn dev
```

Stack:

- Next.js (UI)
- Express (Server)
- Theme-ui ( see `src/theme.js`)
- Formik (forms)

:warning: Please do not commit changes on the `tests/project` folder such as new customtypes. Nobody want's to see that in a PR :warning:  
:information_source: Please use this commande `git checkout packages/slice-machine/tests/project/` before commiting changes.
