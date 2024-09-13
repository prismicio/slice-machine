import { useAdapterName } from "./useAdapterName";

type MarketingContent = {
  tutorial?: {
    url: string;
  };
  masterSliceLibrary?: {
    exampleLinkUrl: string;
    codeLinkUrl: string;
    previewVideoUrl: string;
  };
};

const CONTENT_BY_ADAPTER: Record<string, MarketingContent> = {
  "@slicemachine/adapter-next": {
    tutorial: {
      url: "https://prismic.dev/course/next",
    },
    masterSliceLibrary: {
      exampleLinkUrl: "https://slicify-app.vercel.app/slice-library",
      codeLinkUrl:
        "https://github.com/prismicio-solution-engineering/slicify-library#readme",
      previewVideoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1715957263/Slice_library_video_oemhy0.mp4",
    },
  },
  "@slicemachine/adapter-nuxt": {
    tutorial: {
      url: "https://prismic.dev/course/nuxt",
    },
  },
  "@slicemachine/adapter-sveltekit": {
    tutorial: {
      url: "https://prismic.dev/course/sveltekit",
    },
  },
};

export function useMarketingContent(): MarketingContent {
  const adapterName = useAdapterName();

  return CONTENT_BY_ADAPTER[adapterName] ?? {};
}
