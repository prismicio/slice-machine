import { query } from '../features/query'
import { registry as createRegistry } from '../features/registry'

export const useGetStaticProps = ({
  uid,
  lang,
  params,
  client,
  body = 'body',
  type = 'page',
  queryType = 'repeat',
}) => {
  const apiParams = params || { lang }

  return async function getStaticProps({
    preview = null,
    previewData = {},
    params = {}
  }) {

    const registry = await createRegistry()

    const { ref = null } = previewData
    const resolvedUid = typeof uid === 'function' ? uid({ params, previewData, preview }) : (uid || null)
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
          slices: doc ? doc.data[body] : [],
          registry,
          endpoint: client.api.url
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
          registry: null
        }
      }
    }
  }
}
