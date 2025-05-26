import { useAdapterName } from "./useAdapterName";

type MarketingContent = {
  documentationLink: string;
};

const CONTENT_BY_ADAPTER: Record<string, MarketingContent> = {
  "@slicemachine/adapter-next": {
    documentationLink: "https://prismic.io/docs/nextjs",
  },
  "@slicemachine/adapter-nuxt": {
    documentationLink: "https://prismic.io/docs/nuxt",
  },
  "@slicemachine/adapter-sveltekit": {
    documentationLink: "https://prismic.io/docs/sveltekit",
  },
};

export function useMarketingContent(): MarketingContent {
  const adapterName = useAdapterName();

  return CONTENT_BY_ADAPTER[adapterName] ?? {};
}
