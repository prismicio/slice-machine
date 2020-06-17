# SliceZone (wip)

A component that matches front-end components with Prismic slices.
Pretty much a work in progress, README coming 

RFC: https://github.com/prismicio/slice-machine/issues/7

## Status

* [x] fetch content from getStaticProps
* [x] fetch dynamic paths from Prismic endpoint
[ ] Handle dynamic imports
* [x] handle previews
* [x] Create registry
* [x] pass custom resolver

## Usage

To display the right content, the SliceZone takes as parameters,
props passed at build time by `useGetStaticProps`. Notably:

- `slices`, the array data components fetched from Prismic
- `registry`, an object that maps Prismic slice keys to components
- `theme`, an arbitrary object passed as props to all slices
- `resolver`, a function that resolves calls to components from the SliceZone

⚠️ Resolver being aw wip, you will have to create it manually for a short amount of time:

```javascript
import dynamic from 'next/dynamic'
const resolver = ({ from, sliceName }) =>
    dynamic(() => import(`../slices/${sliceName}.js`))

const Page = ({ theme, registry, slices }) => (
    <SliceZone resolver={resolver} registry={registry} theme={theme} slices={slices} />
)

export const useGetStaticProps(...)

export default Page
````

## Hooks

The SliceZone exports 2 hooks to hep Next.js statically export SliceMachine pages.

### useGetStaticProps

`useGetStaticProps` can be used in every page using the SliceZone.
It's responsible for:
- fetching content from Prismic
- creating your project components registry
- returning a pre-written Next `getStaticProps`

#### example
⚠️ Signature is subject to change

````javascript
import { useGetStaticProps, useGetStaticPaths } from 'next-slicezone/hooks'

const Page = ({ uid, registry, slices }) => (
    <SliceZone resolver={resolver} registry={registry} slices={slices} />
)

export const getStaticProps = useGetStaticProps({
  client, // pass Prismic client here
  type: 'page', // query document of type "page"
  uid: ({ params }) => params.uid // pass a function to `uid` to resolve dynamic content
})
````

#### Properties

`useGetStaticProps` takes a params object as argument.

| Param     	| Type               	| Required 	| Default value      	| Description                                                                     	| Example value                        	|
|-----------	|--------------------	|----------	|--------------------	|---------------------------------------------------------------------------------	|--------------------------------------	|
| uid       	| string \| function 	| false    	| null               	| If queryType has value `repeatable`, pass document `uid` or function            	| ({params}) => `/pages/${params.uid}` 	|
| lang      	| string             	| false    	| null (master lang) 	| Lang attribute, disabled if `params` is passed                                  	| 'fr-fr'                              	|
| params    	| object             	| false    	| null               	| Object passed to client `apiOptions`. Disables `lang`                           	| { lang: 'fr-fr' }                    	|
| client    	| function           	| true     	| null               	| ATM, you have to pass a Prismic client here                                     	| Prismic.client(apiEndpoint)          	|
| body      	| string             	| false    	| body               	| Key of slices array in API response (`doc.data[body]`)                          	| 'nobody'                             	|
| type      	| string             	| false    	| page               	| Custom type to be queried                                                       	| 'another_cts'                        	|
| queryType 	| string             	| false    	| repeat             	| One of 'repeat' or 'single', to switch between `getByUID` and `getSingle` calls 	| 'single'                             	|

### useGetStaticPaths

`useGetStaticPaths` should be used *in each dynamic page* that relies on the SliceZone.
It's responsible for:
- fetching documents by type on Prismic
- 

#### example
⚠️ Signature is subject to change

````javascript
import { useGetStaticProps, useGetStaticPaths } from 'next-slicezone/hooks'

const Page = ({ uid, registry, slices }) => (
    <SliceZone resolver={resolver} registry={registry} slices={slices} />
)

// fetch all docs of type `MyPage` and pass params accordingly
export const getStaticPaths = useGetStaticPaths({
  client: Client(),
  fallback: false,
  type: 'MyPage',
  formatPath: ({ uid }) => ({ params: { uid }})
})

export default Page
````

#### Properties

`useGetStaticPaths` takes a params object as argument.
Refer to [Next docs](https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation) to understand what's expected from `formatPath`.

| Param      	| Type     	| Required 	| Default Value 	| Description                           	| Example                       	|
|------------	|----------	|----------	|---------------	|---------------------------------------	|-------------------------------	|
| type       	| -        	| -        	| -             	| Same as useGetStaticProps             	| -                             	|
| params     	| -        	| -        	| -             	| Same as useGetStaticProps             	| -                             	|
| lang       	| -        	| -        	| -             	| Same as useGetStaticProps             	| -                             	|
| client     	| -        	| -        	| -             	| Same as useGetStaticProps             	| -                             	|
| formatPath 	| function 	| true     	| (doc) => '/'  	| Function to format Next path argument 	| ({uid}) =>({ params:{ uid }}) 	|

## Installation guide

This guide assumes you have a running 9.3+ Next.js project, configured to use Prismic.

#### 1/ Create an `sm.json` file at the root of your Next app
```bash
{ "librairies": ["~/slices"] }
```
👆 This will help the SliceZone locate your slices.

#### 2/ Then install the SliceZone

```bash
yarn add next-slicezone
```

#### 3/ create a `[uid].js` page 

```javascript
import SliceZone from 'next-slicezone'
import { useGetStaticProps, useGetStaticPaths } from 'next-slicezone/hooks'

// you want to do this somewhere else
const client = Prismic.client(apiEndpoint)

// interim
const resolver = ({ sliceName }) => dynamic(() => import(`../slices/${sliceName}.js`))

const Page = ({ uid, registry, slices }) =>  (
    <SliceZone
        resolver={resolver}
        registry={registry}
        slices={slices}
    />
)

export const getStaticProps = useGetStaticProps({
  fs,
  client,
  type: 'page',
  uid: ({ params }) => params.uid
})

export const getStaticPaths = useGetStaticPaths({
  client,
  type: 'page',
  fallback: false,
  formatPath: ({ uid }) => ({ params: { uid }})
})

export default Page
````


#### 4/ Add a slice `my_slice` to your "page" custom type

In your custom types builder, add a slice with key `my_slice` and save it.

#### 5/ Create a page with uid `my-page` on Prismic

Create some content using your `my_slice` slice.

### 6/ create a `MySlice` component in `/slices`

Your pages are now synced with the writing room ✌️
