# `@slicemachine/rpc`

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Conventional Commits][conventional-commits-src]][conventional-commits-href]
[![License][license-src]][license-href]

Simple [remote procedure calls (RPC)][rpc-wiki] in TypeScript.

- 🪡 &nbsp;Fully typed procedure calls using your TypeScript types—no runtime validation needed.
- 🖼️ &nbsp;Handles binary data in both directions (think: file uploads and downloads).
- 🎛️ &nbsp;Compatible with any Express-like server.

## Install

```bash
npm install @slicemachine/rpc
```

## Quick start

1.  Create an RPC Express middleware containing your procedures. A procdure is any sync or async function that accept one or no arguments.

    The middleware can be used anywhere [Express middleware][express-middleware] is accepted.

    ```typescript
    // src/rpc-middleware.ts

    import { createRPCMiddleware, ExtractProcedures } from "@slicemachine/rpc";

    export const middleware = createRPCMiddleware({
    	procedures: {
    		ping: async () => {
    			await new Promise((resolve) => setTimeout(resolve, 1000));

    			return "pong";
    		},
    	},
    });

    // This type will be passed to the RPC client.
    export type Procedures = ExtractProcedures<typeof middleware>;
    ```

2.  Add the middleware to your Express-compatible server.

    ```typescript
    // src/server.ts

    import express from "express";
    import { middleware } from "./rpc-middleware";

    const app = express();

    // Pass `middleware` from the previous step.
    app.use("/rpc", middleware);

    app.listen();
    ```

    The server is now set up to accept RPC calls at `/rpc` using a client.

3.  In your remote app (e.g. your app's frontend), create a client to call the RPC server.

    ```typescript
    // src/index.ts

    import { createRPCClient } from "@slicemachine/rpc";
    import type { Procedures } from "./rpc-middleware";

    const client = createRPCClient<Procedures>({
    	serverURL: "https://example.com/rpc",
    });

    const pong = await client.ping(); // => "pong"
    ```

    Calling `client.ping()` will send a request to the server at `https://example.com/rpc` and return `ping()`'s return value from the server. The client is fully typed using your procedure's types.

## Documentation

To discover what's new on this package check out [the changelog][changelog]. For full documentation, visit [the `docs` directory][docs].

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open a new topic][forum-question] on our community forum explaining what you want to achieve / your question. Our support team will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a pull request][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

For more clarity on this project and its structure you can also check out the detailed [CONTRIBUTING.md][contributing] document.

## License

```

Copyright 2013-2023 Prismic <contact@prismic.io> (https://prismic.io)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

```

<!-- Links -->

[prismic]: https://prismic.io
[rpc-wiki]: https://en.wikipedia.org/wiki/Remote_procedure_call
[express-middleware]: https://expressjs.com/en/guide/using-middleware.html
[docs]: (./docs)

<!-- TODO: Replace link with a more useful one if available -->

[prismic-docs]: https://prismic.io/docs
[changelog]: ./CHANGELOG.md
[contributing]: ./CONTRIBUTING.md

<!-- TODO: Replace link with a more useful one if available -->

[forum-question]: https://community.prismic.io
[repo-bug-report]: https://github.com/prismicio/slice-machine/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio/slice-machine/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio/slice-machine/pulls

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@slicemachine/rpc/latest.svg
[npm-version-href]: https://npmjs.com/package/@slicemachine/rpc
[npm-downloads-src]: https://img.shields.io/npm/dm/@slicemachine/rpc.svg
[npm-downloads-href]: https://npmjs.com/package/@slicemachine/rpc
[github-actions-ci-src]: https://github.com/prismicio/slice-machine/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/prismicio/slice-machine/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/prismicio/slice-machine.svg
[codecov-href]: https://codecov.io/gh/prismicio/slice-machine
[conventional-commits-src]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-href]: https://conventionalcommits.org
[license-src]: https://img.shields.io/npm/l/@slicemachine/rpc.svg
[license-href]: https://npmjs.com/package/@slicemachine/rpc

```

```
