async function fetchDocs(client, docType, apiParams, page = 1, routes = []) {
  const response = await client.query(`[at(document.type, "${docType}")]`, {
    pageSize: 100,
    lang: "*",
    ...apiParams,
    page,
  });
  const allRoutes = routes.concat(response.results);
  if (response.results_size + routes.length < response.total_results_size) {
    return fetchDocs(client, docType, apiParams, page + 1, allRoutes);
  }
  return [...new Set(allRoutes)];
}

async function queryRepeatableDocuments(client, docType, apiParams = {}) {
  return await fetchDocs(client, docType, apiParams);
}

const handleParams = (apiParams = {}, deprecatedParams, lang) => {
  if (lang) {
    console.warn(
      "[next-slicezone] Parameter `lang` is deprecated. Use `apiParams.lang` instead."
    );
  }
  if (deprecatedParams) {
    console.warn(
      "[next-slicezone] Parameter `params` is deprecated. Use `apiParams` instead."
    );
    return deprecatedParams;
  }
  return apiParams;
};

const fbWarn = (fallback) => {
  if (fallback != null) {
    console.warn(
      "[next-slicezone] Parameter `fallback` is deprecated. Use getStaticPathsParams.fallback instead."
    );
  }
};

export const useGetStaticPaths = ({
  type = "page" /* document type to retrieve */,
  formatPath = () =>
    null /* format document to path value expected by Next ({ params...} )*/,
  apiParams /* api params passed to Prismic client */,
  client /* instance of Prismic client */,
  getStaticPathsParams = {
    fallback: false,
  } /* params passed to return object of getStaticPaths */,

  lang /* deprecated, use apiParams.lang instead */,
  params /* deprecated, use apiParams instead */,
  fallback /* deprecated, use getStaticPathsParams.fallback instead */,
}) => {
  fbWarn(fallback);
  const prismicClientParams = handleParams(apiParams, params, lang);
  return async function getStaticPaths() {
    const documents = await queryRepeatableDocuments(
      client,
      type,
      prismicClientParams
    );
    return {
      paths: documents.reduce((acc, doc) => {
        const p = formatPath(doc);
        if (p) {
          return [...acc, p];
        }
        return acc;
      }, []),
      fallback,
      ...getStaticPathsParams,
    };
  };
};
