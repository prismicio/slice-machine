import { useAdapterName } from "./useAdapterName";

type MarketingContent = {
  tutorial: {
    link: {
      title: string;
      url: string;
    };
    tooltip: {
      title: string;
      description: string;
      closeButton?: string;
      video?: {
        cloudName: string;
        publicId: string;
        poster: string;
      };
    };
  };
};

const CONTENT_BY_ADAPTER: Record<string, MarketingContent> = {
  "@slicemachine/adapter-next": {
    tutorial: {
      link: {
        title: "Academy",
        url: "https://prismic.io/academy/prismic-and-nextjs",
      },
      tooltip: {
        title: "Need Help?",
        description:
          "Learn how to turn a Next.js website into a page builder powered by Prismic.",
        closeButton: "Got it",
        video: {
          cloudName: "dmtf1daqp",
          publicId: "Tooltips/pa-course-overview_eaopsn",
          poster: "/prismic-academy-101.png",
        },
      },
    },
  },
};

const DEFAULT_CONTENT: MarketingContent = {
  tutorial: {
    link: {
      title: "Tutorial",
      url: "https://youtube.com/playlist?list=PLUVZjQltoA3wnaQudcqQ3qdZNZ6hyfyhH",
    },
    tooltip: {
      title: "Need Help?",
      description:
        "Follow our Quick Start guide to learn the basics of Slice Machine",
    },
  },
};

export function useMarketingContent(): MarketingContent {
  const adapterName = useAdapterName();
  if (adapterName === undefined) {
    return DEFAULT_CONTENT;
  }

  return CONTENT_BY_ADAPTER[adapterName] ?? DEFAULT_CONTENT;
}
