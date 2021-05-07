import { query } from '../features/query'

export const useGetStaticProps = ({
  client, /* instance of Prismic client */
  body = 'body', /* target tab for slices */
  type = 'page', /* document type to retrieve */
  getStaticPropsParams = {}, /* params passed to return object of getStaticProps */
  queryType = 'repeat', /* one of ["single", "repeat"] */
  apiParams, /* api params passed to Prismic client */

  uid, /* deprecated, use apiParams.uid instead */
  lang, /* deprecated, use apiParams.lang instead */
}) => {

  if (uid) {
    console.warn(`[next-slicezone/useGetStaticProps]: Parameter "uid" is deprecated, use "apiParams.uid" instead.`)
  }
  if (lang) {
    console.warn(`[next-slicezone/useGetStaticProps]: Parameter "lang" is deprecated, use "apiParams.lang" instead.`)
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
          slices: doc?.data?.[body] || [],
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
