# Slice Machine Contributing Guide

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open a new topic][forum-question] on our community forum explaining what you want to achieve / your question. Our support team will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a PR][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

## Local development

Clone the `slice-machine` repository to your local machine.

```
git clone https://github.com/prismicio/slice-machine.git
```

Move into the folder and install the dependencies.

```
cd slice-machine
npm install
```

Start up the dev server.

```
npm run dev
```

Now that the dev server is running you can start the Next.js project used for testing. Move into the `e2e-projects/next` folder and run the `slicemachine:dev` script.

```
cd e2e-projects/next
npm run slicemachine:dev
```

Now you can go to your browser and open `localhost:9999` to see the Slice Machine app up and running with some demo Slices and types.
You're now ready to start working on your changes and see them updated in the app.

<!-- Links -->

[forum-question]: https://community.prismic.io
[repo-bug-report]: https://github.com/prismicio/slice-machine/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio/slice-machine/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio/slice-machine/pulls
