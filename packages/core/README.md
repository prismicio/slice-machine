# Slice Machine Core

Primitive operations and data models for the Slicemachine world.

## Structure

The core is structured in sub-packages that can be used and imported independently. Although most of the operations it provides are filesystem based, you should be able to import Models and utilities in browser-based environments.

## Node-Utils

Query and parse Slicemachine data in the Filesystem

### Framework

Some parts of Slicemachine are framework dependent.
Use `autodetectFramework` to get what's identified in your package.json.

```javascript
import { autodetectFramework } from "@slicemachine/core/build/node-utils";

(async () => {
  const framework = autodetectFramework("." /* project cwd */);
})();
```

### Manifest

Slicemachine projects rely on an `sm.json` file to configure the behaviour of
the plugin (`slice-machine-ui` mostly).

```javascript
import * as Manifest from "@slicemachine/core/build/node-utils/manifest";
import { DEFAULT_BASE } from "@slicemachine/core/build/consts";

(async () => {
  const cwd = "./";

  // creates a manifest at path `./sm.json`
  createManifest(cwd, { apiEndpoint: "https://my-project.prismic.io/api/v2" });

  // my-project
  const maybeRepoName = maybeRepoNameFromSMFile(cwd, DEFAULT_BASE);

  patchManifest(cwd, { storybook: `https://${maybeRepoName}.vercel.app` });

  const { exists, content } = retrieveManifest(cwd);

  console.log({ exists, content }); // true, { apiEndpoint, storybook }
})();
```

### Paths

Resolve paths in the context of a Slicemachine project.

### Pkg

Work with `package.json` files

```javascript
import {
  retrieveJsonPackage,
  patchJsonPackage,
} from "@slicemachine/core/build/node-utils";

(async () => {
  const cwd = "./";
  patchJsonPackage(cwd, { name: "new-name" });
  const { exists, content } = retrieveJsonPackage(cwd);
})();
```

## Libraries (wip)

An essential data model in Slicemachine is `Library`: a set of components
that hold code, Prismic Slice model, screenshots and mocks.

Once registered, retrieve them from the Filesystem

```javascript
import { libraries } from "@slicemachine/core/build/libraries";

(async () => {
  const cwd = "./";
  const libs = [/* local */ "~/slices", /* in node_modules */ "shared-lib"];

  const myLibs = libraries(cwd, libs);
  /*
        [
            name: string,
            path: string,
            isLocal: boolean,
            components: [{
                from: string,
                href: string,
                pathToSlice: string,
                infos: ComponentInfo,
                model: SliceAsObject,
                migrated: boolean,
            }]
        ]

    */
})();
```

## Models

Types (+ helpers) of Slicemachine data models

## Prismic

Helpers to interact with Prismic and Prismic Shared Config object (~/.prismic)

## Utils (expanding)

Various helpers to deal with Slicemachine specifics

```javascript
import { pascalize, snakelize } from "@slicemachine/core/build/utils";

(async () => {
  const camelName = "camelName";

  const componentName = pascalize(camelName); // CamelName
  const prismicId = snakelize(camelName); // camel_name
})();
```
