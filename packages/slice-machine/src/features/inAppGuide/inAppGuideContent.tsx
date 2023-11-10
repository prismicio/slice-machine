import { TextLink } from "@prismicio/editor-ui";

export const IN_APP_GUIDE_CONTENT = {
  title: "Build your first page in 5 minutes",
  steps: [
    {
      title: "Add slice to your page",
      videoUrl:
        "https://images.prismic.io/page-builder-assets/8f5df837-d8c2-4aed-832c-dec21d3915d0_New+Recording+Jul+18+2023+0350+PM.mp4",
      description:
        "Try one of our templates to get started after the creation of your first page",
    },
    {
      title: "Code your page",
      videoUrl:
        "https://images.prismic.io/page-builder-assets/8f5df837-d8c2-4aed-832c-dec21d3915d0_New+Recording+Jul+18+2023+0350+PM.mp4",
      description:
        "Slice Machine provides code snippets. Copy-paste them into your page component to render your page.",
    },
    {
      title: "Push models to the Page Builder",
      videoUrl:
        "https://images.prismic.io/page-builder-assets/8f5df837-d8c2-4aed-832c-dec21d3915d0_New+Recording+Jul+18+2023+0350+PM.mp4",
      description:
        "You have just created some models, but you can’t use them yet. First, you must push them to the Page Builder. The Page Builder is where you create content. Go head — push your models.",
    },
    {
      title: "Create your first page",
      videoUrl:
        "https://images.prismic.io/page-builder-assets/8f5df837-d8c2-4aed-832c-dec21d3915d0_New+Recording+Jul+18+2023+0350+PM.mp4",
      description: (
        <>
          In your{" "}
          <TextLink href="TODO" underline>
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
        "https://images.prismic.io/page-builder-assets/8f5df837-d8c2-4aed-832c-dec21d3915d0_New+Recording+Jul+18+2023+0350+PM.mp4",
      description: (
        <>
          Run your project on{" "}
          <TextLink href="TODO" underline>
            localhost
          </TextLink>{" "}
          to see your first page.
        </>
      ),
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
