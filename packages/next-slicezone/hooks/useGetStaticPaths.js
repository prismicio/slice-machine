async function fetchDocs(client, params, page = 1, routes = []) {
  const response = await client.query('', { pageSize: 100, lang: '*', ...params, page });
  const allRoutes = routes.concat(response.results);
  if (response.results_size + routes.length < response.total_results_size) {
    return fetchDocs(client, params, page + 1, allRoutes);
  }
  return [...new Set(allRoutes)];
};

async function queryRepeatableDocuments(client, params = {}, filter) {
  const allRoutes = await fetchDocs(client, params)
  return allRoutes.filter(filter)
}

export const useGetStaticPaths = ({
  type = 'page',
  fallback = false,
  formatPath = () => '/',
  params,
  lang,
  client
}) => {
  const apiParams = params || { lang }

  return async function getStaticPaths() {
     const documents = await queryRepeatableDocuments(client, apiParams, (doc) => doc.type === type)
    return {
      paths: documents.map(formatPath),
      fallback,
    }
  }
}