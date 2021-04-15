import { query } from '../features/query'

export const useGetStaticProps = ({
  uid,
  lang,
  params: initialParams,
  client,
  body = 'body',
  type = 'page',
  queryType = 'repeat',
}) => {

  return async function getStaticProps({
    preview = null,
    previewData = {},
    params = {}
  }) {

    const { ref = null } = previewData
    const resolvedLang = typeof lang === 'function' ? lang({ params, previewData, preview }) : (lang || null)
    const resolvedUid = typeof uid === 'function' ? uid({ params, previewData, preview }) : (uid || null)

    const apiParams = initialParams || { lang: resolvedLang }
    try {
      const doc = await query({
        queryType,
        apiParams: Object.assign({ ref }, apiParams),
        type,
        uid: resolvedUid,
        client,
      })
      return {
        props: {
          ...doc,
          error: null,
          preview,
          previewData,
          slices: doc ? doc.data[body] : [],
        }
      }

    } catch(e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[next-slicezone] ${e.toString()}`)
      }
      return {
        props: {
          ref,
          error: e.toString(),
          uid: resolvedUid,
          slices: [],
          preview,
          previewData,
          // registry: null
        }
      }
    }
  }
}
