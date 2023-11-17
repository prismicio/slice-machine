import { TextLink } from "@prismicio/editor-ui";

export const IN_APP_GUIDE_CONTENT = {
  title: "Build your first page in 5 minutes",
  steps: [
    {
      title: "Add slice to your page",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/ADD_SLICE.mp4",
      description:
        "Try one of our templates to get started after the creation of your first page",
    },
    {
      title: "Code your page",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/CODE_SNIP.mp4",
      description:
        "Slice Machine provides code snippets. Copy-paste them into your page component to render your page.",
    },
    {
      title: "Push models to the Page Builder",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PUSH.mp4",
      description:
        "You have just created some models, but you can't use them yet. First, you must push them to the Page Builder. The Page Builder is where you create content. Go head — push your models.",
    },
    {
      title: "Create your first page",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/WRITE.mp4",
      description: (repositoryUrl: string) => (
        <>
          In your{" "}
          <TextLink href={repositoryUrl} underline>
            Page Builder
          </TextLink>
          , create your first page. Add slices to the page to create content.
          Then save and publish and come back here.
        </>
      ),
    },
    {
      title: "Render your page",
      videoUrl:
        "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PREVIEW.mp4",
      description: "Run your project on localhost to see your first page.",
    },
  ],
  successTitle: "You have made your first page!",
  successSteps: [
    "Edit, and style your slices",
    "Create more pages in the Page Builder",
    <>
      Learn how to{" "}
      <TextLink href="TODO" underline>
        manage your routes
      </TextLink>
    </>,
  ],
};
