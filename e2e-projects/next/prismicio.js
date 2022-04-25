import * as prismic from '@prismicio/client'
import { enableAutoPreviews } from '@prismicio/next'
import sm from './sm.json'

export const endpoint = sm.apiEndpoint
export const repositoryName = prismic.getRepositoryName(endpoint)

//Update the Link Resolver to match your project's route structure
export function linkResolver(doc) {
  switch (doc.type) {
    case 'home-page':
      return `/`
    case 'page':
      return `/${doc.uid}`
      case 'blog-page':
        return `/blog/${doc.uid}`
    default:
      return '/'
  }
}

// This factory function allows smooth preview setup
export function createClient(config = {}) {
  const client = prismic.createClient(endpoint, {
    ...config,
    routes: routeResolver.routes
  })

  enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req,
  })

  return client
}

//Route resolver to match your project's route structure

export const routeResolver = {
  routes: [
    {
      "type":"page",
      "path":"/:lang/:uid"
    },
    // {
    //   "type":"product-page",
    //   "path":"/:lang/product/:uid"
    // },
    // {
    //   "type":"category-page",
    //   "path":"/:lang/category/:uid"
    // },
    {
      "type":"blog-page",
      "path":"/:lang/blog/:uid"
    },
    // {
    //   "type":"marketing-homepage",
    //   "path":"/marketing/"
    // },
    // {
    //   "type":"uniform-page",
    //   "path":"/uniform/:uid"
    // },
    {
      "type":"home-page",
      "path":"/:lang"
    },],
  href: (type) => {
    const route = routeResolver.routes.find(r => r.type === type);
    return route && route.href;
  }
};