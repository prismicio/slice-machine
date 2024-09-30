import { Button, Image, theme } from "@prismicio/editor-ui";

import { telemetry } from "@/apiClient";
import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateImage,
  BlankSlateTitle,
} from "@/components/BlankSlate";

interface NoChangesBlankSlateProps {
  isPostPush: boolean;
  documentsListEndpoint: string;
}
export function NoChangesBlankSlate(props: NoChangesBlankSlateProps) {
  const { isPostPush, documentsListEndpoint } = props;

  const content = getBlankSlateContent(isPostPush);

  return (
    <BlankSlate style={{ alignSelf: "center", marginTop: theme.space[72] }}>
      <BlankSlateImage>
        <Image src={content.img} sizing="cover" />
      </BlankSlateImage>
      <BlankSlateContent>
        <BlankSlateTitle>{content.title}</BlankSlateTitle>
        <BlankSlateDescription>{content.description}</BlankSlateDescription>

        {isPostPush && (
          <BlankSlateActions>
            <Button
              onClick={() => {
                void telemetry.track({
                  event: "post-push:empty-state-cta-clicked",
                });
                window.open(documentsListEndpoint, "_blank");
              }}
              size="large"
            >
              Create content in the Page Builder
            </Button>
          </BlankSlateActions>
        )}
      </BlankSlateContent>
    </BlankSlate>
  );
}

interface BlankSlateContent {
  img: string;
  title: string;
  description: string;
}

function getBlankSlateContent(isPostPush: boolean): BlankSlateContent {
  if (isPostPush) return postPushContent;
  return blankSlateContent;
}

const blankSlateContent = {
  img: "/blank-slate-changes-uptodate.png",
  title: "Everything is up-to-date",
  description:
    "No changes are staged. Saved updates will appear here, ready to be pushed to the Page Builder.",
};

const postPushContent = {
  img: "/blank-slate-push-success.png",
  title: "Success! Your changes have been pushed to the Page Builder.",
  description: "Add content to your website to bring it to life!",
};
