# Next SliceZone

A component that fetches Prismic files, returns slices found and matches them with front-end components.

RFC: https://github.com/prismicio/slice-machine/issues/7

## Fetching content

Next SliceZone exports 2 functions that are designed to help you quickly get all static paths of a NextJS given route, fetch associated documents on Prismic, and return slices found there.

### useGetStaticProps

`useGetStaticProps` can be used in every page using the SliceZone.
It's responsible for:

- fetching content from Prismic
- returning a pre-written Next `getStaticProps`

#### Page example

Query a singleton page of type "homepage"

```javascript
import { Client } from "../prismic";
import { useGetStaticProps } from "next-slicezone/hooks";
import resolver from "../sm-resolver";

const Page = ({ uid, slices }) => (
  <SliceZone resolver={resolver} slices={slices} />
);

export const getStaticProps = useGetStaticProps({
  client: Client(),
  type: "homepage", // query document of type "page"
  queryType: "single", // homepage is a singleton document
});

export default Page;
```

#### Properties

`useGetStaticProps` takes a params object as argument.

| Param                | Type     | Required | Default value | Description                                                                     | Example value               |
| -------------------- | -------- | -------- | ------------- | ------------------------------------------------------------------------------- | --------------------------- |
| apiParams            | object   | false    | null          | Object passed to client `apiOptions`.                                           | { lang: 'fr-fr' }           |
| client               | function | true     | null          | Pass a Prismic client here                                                      | Prismic.client(apiEndpoint) |
| slicesKey            | string   | false    | body / slices | Key of slices array in API response (`doc.data[slicesKey]`)                     | 'MySliceZone'               |
| type                 | string   | false    | page          | Custom type to be queried                                                       | 'another_cts'               |
| queryType            | string   | false    | repeat        | One of 'repeat' or 'single', to switch between `getByUID` and `getSingle` calls | 'single'                    |
| getStaticPropsParams | object   | false    | null          | Object passed to return object of `getStatcProps`                               | { revalidate: true }        |

#### Example with API Params

Your API calls might depend on other factors in your app, for example the language the user talks. Pass an `apiParams` object or function to transform your call to the Prismic API.

```javascript
const PageInFrench = ({ uid, slices }) => (
  <SliceZone resolver={resolver} slices={slices} />
);

export const getStaticProps = useGetStaticProps({
  client: Client(),
  type: "homepage", // query document of type "page"
  queryType: "single", // homepage is a singleton document
  apiParams: {
    lang: "fr-fr",
  },
});

export default PageInFrench;
```

👆 `apiParams` can also be a function! See example below

### useGetStaticPaths

`useGetStaticPaths` should be used _in each dynamic page_ that relies on the SliceZone.
It's responsible for:

- fetching documents by type on Prismic
- formatting params passed to getStaticProps

#### Page example (`/pages/[lang]/[uid]`)

Query a repeatable type "page" in a language based on URL parameter.

```javascript
import { useGetStaticProps, useGetStaticPaths } from "next-slicezone/hooks";

const Page = ({ uid, slices, data }) => (
  <div>
    <h1>{data.keyTextTitle}</h1>
    <SliceZone resolver={resolver} slices={slices} />
  </div>
);

export const getStaticProps = useGetStaticProps({
  type: "page",
  queryType: "repeat",
  apiParams({ params }) {
    // params are passed by getStaticPaths
    return {
      lang: params.lang,
      uid: params.uid,
    };
  },
});

// fetch all docs of type `MyPage` and pass params accordingly
export const getStaticPaths = useGetStaticPaths({
  client: Client(),
  type: "page",
  formatPath: (prismicDocument) => {
    return {
      params: {
        uid: prismicDocument.uid,
        lang: prismicDocument.lang,
      },
    };
  },
});

export default Page;
```

#### Properties

`useGetStaticPaths` takes a params object as argument.
Refer to [Next docs](https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation) to understand what's expected from `formatPath`.

| Param      | Type     | Required | Default Value | Description                                               | Example                       |
| ---------- | -------- | -------- | ------------- | --------------------------------------------------------- | ----------------------------- |
| type       | -        | -        | -             | Same as useGetStaticProps                                 | -                             |
| apiParams  | -        | -        | -             | Same as useGetStaticProps                                 | -                             |
| client     | -        | -        | -             | Same as useGetStaticProps                                 | -                             |
| formatPath | function | true     | (doc) => null | Function to format Next path argument. Pass null to skip. | ({uid}) =>({ params:{ uid }}) |

### SliceZone

Once slices have been fetched server-side, we need to get all slices found and match them with your components.

To display the right content, the SliceZone takes as parameters
props passed at build time by `useGetStaticProps`. Notably:

- `slices`, the array data components fetched from Prismic
- `resolver`, a function that resolves calls to components from the SliceZone
- `sliceProps`, an object or function that passes props to matched slices

#### Example SliceZone

```
const Page = ({ data, slices }) => (
    <SliceZone
        slices={slices}
        resolver={resolver}
        sliceProps={({ slice, sliceName, i }) => ({
           theme: i % 1 ? 'light' : 'dark',
           alignLeft: data.keyTextTitle?.length > 35
        })}
)

```

The resolver function can be generated for you and should be everytime you make a change to your slices structure (rename, add, delete a slice, add a library...). To do this, create a `pages/_document` file and add the `createResolver` method to its `getInitialProps` method:

#### Example \_document file

```javascript
import Document, { Html, Head, Main, NextScript } from "next/document";
import { createResolver } from "next-slicezone/resolver";

export default class extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    /* In development, generate an sm-resolver.js file
    that will map slices to components */
    if (process.env.NODE_ENV === "development") {
      await createResolver();
    }
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
```
