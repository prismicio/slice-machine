import { Text } from "@prismicio/editor-ui";

import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";

export function useInAppGuideContent() {
  const { repositoryUrl } = useRepositoryInformation();

  return {
    title: "Build a page in 5 minutes",
    description:
      "Great, now that you have a page type, let's make it a live page!",
    steps: [
      {
        title: "Add slices to your page type",
        videoUrl:
          "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/ADD_SLICE.mp4",
        description: "Use slice templates and add them to your page type.",
      },
      {
        title: "Code your page",
        videoUrl:
          "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/CODE_SNIP.mp4",
        description:
          "If you don't already have a page component, copy-paste the page snippets provided in your page type to create one.",
      },
      {
        title: "Push to your Page Builder",
        videoUrl:
          "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PUSH.mp4",
        description:
          "You have just created some models, but you can't use them yet. First, you must push them to the Page Builder. The Page Builder is where you create content. Go head — push your models.",
      },
      {
        title: "Create content",
        videoUrl:
          "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/WRITE.mp4",
        description: (
          <>
            Open your{" "}
            <Text href={repositoryUrl} underline>
              Page Builder
            </Text>
            , create a page, add slices, save, and publish. Then, come back
            here.
          </>
        ),
      },
      {
        title: "Render your page",
        videoUrl:
          "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PREVIEW.mp4",
        description: (
          <>
            To render the page, run your project in your terminal and visit the
            page on localhost (e.g.{" "}
            <Text component="code">localhost:3000/example-page</Text>).
          </>
        ),
      },
    ],
    successTitle: "Next",
    successDescription:
      "Create more slices and then go back to the Page Builder to build out your website.",
  };
}
