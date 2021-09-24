import { query } from '../features/query'

export const findSlices = (doc, slicesKey) => {
  let slices;
  if (doc) {
    if (slicesKey) {
      // If slicesKey is specified then use slicesKey...
      if (slicesKey in doc.data && Array.isArray(doc.data[slicesKey])) {
        slices = doc.data[slicesKey]
      } else {
        console.error("[SliceZone/useGetStaticProps] Cannot find slice zone at specified key `%s`\n\nCheck the document below to make sure you provided the right key:", slicesKey, doc.data);
      }
    } else {
      // ...else try to find default slice zone
      for (const key of ["body", "slices"]) {
        if (key in doc.data && Array.isArray(doc.data[key])) {
          slices = doc.data[key]
          break
        }
      }

      // If slice zone is still not found
      if (!slices) {
        console.error("[SliceZone/useGetStaticProps] Cannot find slice zone in document\n\nCheck the document below to make sure your slice zone is here or provide the `slicesKey` option:\n\nuseGetStaticProps({ /* ... */ slicesKey: \"mySliceZone\" });\n", doc.data);
      }
    }
  }

  return slices || [];
}

export const useGetStaticProps = ({
  client, /* instance of Prismic client */
  slicesKey, /* slices array accessor */
  type = 'page', /* document type to retrieve */
  getStaticPropsParams = {}, /* params passed to return object of getStaticProps */
  queryType = 'repeat', /* one of ["single", "repeat"] */
  apiParams, /* api params passed to Prismic client */

  uid, /* deprecated, use apiParams.uid instead */
  lang, /* deprecated, use apiParams.lang instead */
  body, /* deprecated, use slicesKey instead */
}) => {

  if (uid) {
    console.warn(`[next-slicezone/useGetStaticProps]: Parameter "uid" is deprecated, use "apiParams.uid" instead.`)
  }
  if (lang) {
    console.warn(`[next-slicezone/useGetStaticProps]: Parameter "lang" is deprecated, use "apiParams.lang" instead.`)
  }
  if (body) {
    console.warn(`[next-slicezone/useGetStaticProps]: Parameter "body" is deprecated, use "slicesKey" instead.`)
  }

  return async function getStaticProps({
    preview = null,
    previewData = {},
    params = {}
  }) {

    const { ref = null } = previewData
    const finalApiParams = apiParams && typeof apiParams === 'function'
      ? apiParams({ params, previewData, preview })
      : apiParams

    try {
      const doc = await query({
        queryType,
        apiParams: Object.assign({ ref }, finalApiParams),
        type,
        client,
      })

      return {
        props: {
          ...doc,
          error: null,
          preview,
          previewData,
          slices: findSlices(doc, slicesKey || body),
        },
        ...getStaticPropsParams
      }

    } catch(e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[next-slicezone] ${e.toString()}`)
      }
      return {
        props: {
          ref,
          error: e.toString(),
          apiParams,
          slices: [],
          preview,
          previewData,
        },
        ...getStaticPropsParams
      }
    }
  }
}
