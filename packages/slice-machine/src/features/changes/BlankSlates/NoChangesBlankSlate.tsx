import { Button, Image, theme } from "@prismicio/editor-ui";
import router from "next/router";
import { FiExternalLink } from "react-icons/fi";

import { telemetry } from "@/apiClient";
import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateImage,
  BlankSlateTitle,
} from "@/components/BlankSlate";
import { TextLink } from "@/components/TextLink";

interface NoChangesBlankSlateProps {
  isPostPush: boolean;
  documentsListEndpoint: string;
  isPromptToCreateContentExperimentEligible: boolean;
}
export function NoChangesBlankSlate(props: NoChangesBlankSlateProps) {
  const {
    isPostPush,
    documentsListEndpoint,
    isPromptToCreateContentExperimentEligible,
  } = props;

  const content = getBlankSlateContent(
    isPostPush,
    isPromptToCreateContentExperimentEligible,
  );

  return (
    <BlankSlate style={{ alignSelf: "center", marginTop: theme.space[72] }}>
      <BlankSlateImage>
        <Image src={content.img} sizing="cover" />
      </BlankSlateImage>
      <BlankSlateContent>
        <BlankSlateTitle>{content.title}</BlankSlateTitle>
        <BlankSlateDescription>{content.description}</BlankSlateDescription>

        {isPromptToCreateContentExperimentEligible ? (
          isPostPush && (
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
          )
        ) : (
          <BlankSlateActions>
            <Button onClick={() => void router.push("/")}>
              Create a page type
            </Button>
            <TextLink
              endIcon={<FiExternalLink />}
              textVariant="normal"
              href={documentsListEndpoint}
            >
              Create content
            </TextLink>
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

function getBlankSlateContent(
  isPostPush: boolean,
  isExperiment: boolean,
): BlankSlateContent {
  if (isExperiment && isPostPush) return experimentPostPushContent;
  if (isExperiment) return experimentBlankSlateContent;
  return blankSlateContent;
}

// control variant content
const blankSlateContent = {
  img: "/blank-slate-changes-uptodate.png",
  title: "Everything is up-to-date",
  description:
    "You have no changes staged. Your changes appear here after you have saved them, while they're waiting to be pushed to the Page Builder. Ready to get going?",
};

// experiment variants content
const experimentBlankSlateContent = {
  img: "/blank-slate-changes-uptodate.png",
  title: "Everything is up-to-date",
  description:
    "No changes are staged. Saved updates will appear here, ready to be pushed to the Page Builder.",
};

const experimentPostPushContent = {
  img: "/blank-slate-push-success.png",
  title: "Success! Your changes have been pushed to the Page Builder.",
  description: "Add content to your website to bring it to life!",
};
