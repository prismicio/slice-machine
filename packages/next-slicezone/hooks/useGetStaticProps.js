import { query } from '../features/query'

export const findSlices = (data = {}, slicesKey) => {
  if (slicesKey) {
    const maybeSlices = data[slicesKey]
    if (!maybeSlices) {
      console.warn(`[next-slicezone/useGetStaticProps]: Slices "data[${slicesKey}]" not found. Please check that this key exists.`)
      return []
    }
    return maybeSlices
  }
  const maybeSlices = data.body || data.slices
  if (!maybeSlices) {
    console.warn(`[next-slicezone/useGetStaticProps]: Slices could not be found automatically (data.body || data.slices). Please pass a "slicesKey".`)
    return []
  }
  return maybeSlices
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

      const slices = findSlices(doc?.data, slicesKey || body)

      return {
        props: {
          ...doc,
          error: null,
          preview,
          previewData,
          slices,
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
