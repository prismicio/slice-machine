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
  masterSliceLibrary?: {
    exampleLinkUrl: string;
    codeLinkUrl: string;
    previewVideoUrl: string;
  };
};

const CONTENT_BY_ADAPTER: Record<string, MarketingContent> = {
  "@slicemachine/adapter-next": {
    tutorial: {
      link: {
        title: "Learn Prismic",
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
    masterSliceLibrary: {
      exampleLinkUrl: "https://slicify-app.vercel.app/slice-library",
      codeLinkUrl:
        "https://github.com/prismicio-solution-engineering/slicify-library#readme",
      previewVideoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1715957263/Slice_library_video_oemhy0.mp4",
    },
  },
};

const DEFAULT_CONTENT: MarketingContent = {
  tutorial: {
    link: {
      title: "Learn Prismic",
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

  return CONTENT_BY_ADAPTER[adapterName] ?? DEFAULT_CONTENT;
}
