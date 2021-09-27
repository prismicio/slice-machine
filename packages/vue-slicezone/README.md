# SliceZone

A [Slice Machine](https://slicemachine.dev) component that matches Vue/Nuxt components with Prismic data components (that we call slices). You can see it as an hybrid between a "[components registry](https://medium.com/front-end-weekly/building-a-component-registry-in-react-4504ca271e56)" and a router:

- at build time, it scans and lists all available components [via a resolver](https://github.com/prismicio/slice-machine/tree/master/packages/nuxt-sm) (README wip)
- when a page is hit, it fetches the corresponding content on Prismic
- it then matches Prismic slices with components, and renders them accordingly

This implementation is meant to work with both Vue and Nuxt projects, although the auto-fetch feature is currently only available with Nuxt. Also, feel free to use this repository as a reference for building SliceZones for other frameworks ✌️

## Installation

```bash
yarn add vue-slicezone
```

You may have to configure your bundler to transpile it from es6:

```javascript
// nuxt.config.js
build: {
  transpile: ["vue-slicezone"];
}
```

It expects a `$prismic` object to be injected by [`@prismicio/vue`](https://github.com/prismicio/prismic-vue) or [`@nuxtjs/prismic`](https://github.com/nuxt-community/prismic-nuxt). If you don't have a running project yet, the easisest way would be to take SliceMachine's [quick start guide](https://www.slicemachine.dev/documentation/getting-started).

## Examples

Depending on your context, you may use the SliceZone with or without `nuxt-sm`. Its role is to auto-scan your librairies and make a resolver out of them. As this became irrelevant in Nuxt 2.10+ thanks to [@nuxt/components](https://github.com/nuxt/components), we'll deprecate `nuxt-sm` in favour of extending components folder (see [this paragraph](https://github.com/nuxt/components#library-authors)).

### with nuxt-sm and auto-fetch

This example assumes you created an `sm.json` file at the root of your project, and listed `nuxt-sm` in your Nuxt modules config:

**sm.json**

```JSON
{"libraries": ["@/slices", "vue-essential-slices"]}
```

**pages/\_uid.vue**

```vue
<template>
  <slice-zone type="page" :uid="$route.params.uid" />
</template>
<script>
import SliceZone from "vue-slicezone";

export default {
  components: {
    SliceZone,
  },
};
</script>
```

👆 This would fetch a Prismic document of type "page", by its UID. For each slice found, it would take its `slice_type` and find a related PascalNamed components in `/slices` folder or in `vue-essential-slices` node module.

### with custom query & w/o nuxt-sm

You can also pass a `slices` array to the SliceZone. usually, this would be the `data.body` of a Prismic API response. You can pass your custom resolver too:

```javascript
<template>
  <slice-zone type="page" :resolver="resolver" :slices="page.data.body" />
</template>
<script>
import * as MySlices from '@/slices'
import SliceZone from 'vue-slicezone'

export default {
  components: {
    SliceZone
  },
  async asyncData({ params, $prismic }) {
    return {
        page: await $prismic.api.getByUID('page', params.uid)
      }
  },
  methods: {
    resolver({ sliceName, slice, i }) {
      return MySlices[sliceName]
    }
  }
}
</script>
```

## Features

Feature requests much appreciated 👇

### Auto-fetch Prismic data

If no `slices` are provided, the SliceZone will auto-fetch a document based on its type and uid.

```html
<slice-zone type="myCustomType" uid="contact" />
```

👆 this is like passing a prop `queryType` with value `repeat` or `repeatable`.
This is how you would fetch a single document:

```html
<slice-zone type="mySingleCustomType" queryType="single" />
```

If slices are not stored in `body`, pass a `body` param with the key name of your zone:

```html
<slice-zone type="mySingleCustomType" queryType="single" body="another_body" />
```

If you need to pass params to the API call (like fetch links), pass the SliceZone a `params` object:

```html
<slice-zone
  type="myCustomType"
  :uid="$route.params.uid"
  :params="{ key: 'value' }"
/>
```

If you just need to pass a lang, to the API, pass the prop directly:

```html
<slice-zone type="myCustomType" :uid="$route.params.uid" lang="fr-fr" />
```

### Auto-match components

Instead of passing a resolver to the SliceZone, we offer a `nuxt-sm` module that lists and scans your components folder and creates a custom resolver out of them. Your SliceZone then acts as a large "bucket" of components that would get rendered solely based on how they match Prismic slices.

**How it scans**
`nuxt-sm` looks for a key `libraries` inside the `sm.json` file at the root of your project. It then scans each folder, whether it's local or in node_modules, and registers it. This is similar to how `prismic sm --ls` command works.

Order matters. If 2 slices have the same name, the first one found is used. This lets you progressively enhance your app, by replacing a default component with your own.

**How it works**
In Prismic, each slice returned by the API contains a snake_cased `slice_type`. The SliceZone simply PascalCases this `slice_type` and asks the resolver if a component with given SliceName has been registered. If something is returned, it then passes a `slice` prop to the component and renders it.

If you created a slice in Prismic with a slice_type of value `my_component`, the SliceZone wil ask for a component with a file/folder name `MyComponent`.

** custom **

You can also pass your own resolver to the SliceZone. It expects one of thesse to be returned:

- a component (see 2nd example)
- a promise that returns a component
- an array of promises

```js
methods: {
    resolver({ sliceName }) {
      return Slices[sliceName]
    },
    resolverP({ sliceName }) {
      return import(`path/to/slices/${sliceName}/index.vue`)
    },
    resolverPs({ sliceName }) {
      return [
        import(`path/to/slices/${sliceName}/index.vue`),
        import(`a/default/path/to${sliceName}/index.vue`),
      ]
    },
  }
```

## Theme

Inspired by [`theme-ui`](https://theme-ui.com), the SliceZone supports passing a theme object or function to rendered slices. We think it's super handy for developers/designers to enforce ceertain design rules on specific pages, or if they're working with external libraries.

### theme object

If you wanted your contact page to use a b&w theme, you could pass an object like this one:

```javascript
<template>
    <slice-zone type="page" uid="contact" :theme="theme" />
</template>
<script>
const theme = {
    color: '#FFF',
    wrapper: {
        style: 'background: #111'
    }
}
export default {
    data() {
        return {
            theme
        }
    }
}
</script>
```

👆 How this is used depends on your implementation. See [vue-essential-slices](https://vue-essential-slices.netlify.com/) for a real world example.

### scoped theme

To scope theme values to specific components, use their name as key. None of the root values would be used in that case. If you need to share some properties, spread them multiple times.

```javascript
const theme = {
  color: "#111",
  CallToAction: {
    color: "#FFF",
  },
};
```

### as function

Alternatively , you can pass a function as theme...

```javascript
const theme = ({ sliceName, i }) =>
  i % 2 ? { color: "#111" } : { color: "pink" };
```

...including in a scoped theme:

```javascript
const theme = {
  CallToAction: ({ sliceName, i }) =>
    i % 2 ? { color: "#111" } : { color: "pink" },
};
```

### Named slots

The SliceZone takes advantage of Vue named slots. To use them, prefix them with the name of your component. For example, if your HeroAction components defines a `header` slot, you can access it this way in the SliceZone:

```vue
<template>
    <slice-zone type="page" uid="contact" :theme="theme" :slices="page.data.body">
        <template v-slot:HeroAction.header="primary">
            <header>
                <h1>Header {{ primary.someContent }}</h1>
            </header>
        </template>
    </slice-zone
</template>
```

Usually, slice components would bind `primary` or `items` to the slot, for you to use in your template. Note that we're passing `slices` here, as named slots does not work yet with auto-fetching content.
