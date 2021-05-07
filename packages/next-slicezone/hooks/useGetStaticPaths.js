async function fetchDocs(client, docType, params, page = 1, routes = []) {
  const response = await client.query(`[at(document.type, "${docType}")]`, { pageSize: 100, lang: '*', ...params, page });
  const allRoutes = routes.concat(response.results);
  if (response.results_size + routes.length < response.total_results_size) {
    return fetchDocs(client, params, page + 1, allRoutes);
  }
  return [...new Set(allRoutes)];
};

async function queryRepeatableDocuments(client, docType, params = {}) {
  return await fetchDocs(client, docType, params)
}

const handleParams = (apiParams = {}, deprecatedParams, lang) => {
  let params = { lang, ...apiParams }
  if (deprecatedParams) {
    console.warn('[next-slicezone] Parameter `params` is deprecated. Use `apiParams` instead.')
    params = { lang, ...deprecatedParams }
  }
  return params
}

export const useGetStaticPaths = ({
  type = 'page', /* document type to retrieve */
  fallback = false, /* should I return 404 on route not found? */
  formatPath = () => null, /* format document to path value expected by Next ({ params...} )*/
  apiParams, /* api params passed to Prismic client */
  params, /* deprecated, use apiParams instead */
  lang = '*', /* set lang in API params */
  client, /* instance of Prismic client */
  getStaticPathsParams = {}, /* params passed to return object of getStaticPaths */
}) => {
  const prismicClientParams = handleParams(apiParams, params, lang)
  return async function getStaticPaths() {
     const documents = await queryRepeatableDocuments(client, type, prismicClientParams)
    return {
      paths: documents.reduce((acc, doc) => {
        const p = formatPath(doc)
        if (p) {
          return [...acc, p]
        }
        return acc
      }, []),
      fallback,
      ...getStaticPathsParams
    }
  }
}