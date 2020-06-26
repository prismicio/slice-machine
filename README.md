<p align="center">
  <a href="https://slicemachine.dev/">
    <img src="logo.svg" alt="Slice Machine logo" width="220" />
  </a>
</p>
<p align="center">
  A workflow for developing and deploying website sections
</p>

# Slice Machine

Slice Machine is a tool that helps you build and maintain page sections, define their model, edit properties, deploy them, and much more! It also comes with a visual interface, Prismic, that allows even your most technically challenged colleagues to easily build pages without any further help from the dev team.

As of today, Slice Machine works with [Nuxt.js](https://nuxtjs.org/) and [Next.js](https://nextjs.org/) but support for other technologies is coming soon!

You can learn more about Slice Machine itself at **[slicemachine.dev](https://slicemachine.dev/)**.

## Prismic?

Prismic is a Headless CMS that offers unlimited custom types, API calls, and a bunch of other great things. You can check it out **[here](https://prismic.io/)**.

## Documentation

If you're looking for how to use Slice Machine with your project check out our **[Quick Start guide](https://www.slicemachine.dev/documentation/getting-started)** or have a look at **[Slice Machine documentation](https://www.slicemachine.dev/documentation)**.

# This repository

This repository is the main repository of the Slice Machine project, it is managed as a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) by [Lerna](https://github.com/lerna/lerna) and composed of many [npm packages](https://github.com/babel/babel/blob/main/packages/README.md).

## Packages

Here is some information about inner packages:

- [next-slicezone](/packages/next-slicezone): slice zone component for Next.js ;
- [nuxt-sm](/packages/nuxt-sm): Nuxt.js companion module for Vue.js slice zone ;
- [sm-api](/packages/sm-api): Slice Machine API serving different parts of the project ;
- [sm-commons](/packages/sm-commons): common utilities for Slice Machine ;
- [vue-slicezone](/packages/vue-slicezone): slice zone component for Vue.js.

# Some resources

- Want to contribute? Check out our **[Contribution Guide](https://www.slicemachine.dev/documentation/contributing)** ;
- Having an issue? Reach out to us on our **[Community Forum](https://community.prismic.io/c/slice-machine/27)** ;
- Discussions around the evolution of Slice Machine often take the form of RFCs, feel free to **[take part in them](https://github.com/prismicio/slice-machine/issues?q=is%3Aopen+is%3Aissue+label%3Adiscussion)**.

## Slice libraries

A _"libraries page"_ will drop soon on **[Slice Machine website](https://slicemachine.dev/)**, in the meantime here are existing slice libraries:

- [vue-essential-slices](https://github.com/prismicio/vue-essential-slices): Vue.js default slice library ;
- [essential-slices](https://github.com/prismicio/essential-slices): React.js default slice library.
