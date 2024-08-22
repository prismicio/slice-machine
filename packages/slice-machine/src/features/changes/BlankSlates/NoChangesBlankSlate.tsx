import { Button, Image, theme } from "@prismicio/editor-ui";
import router from "next/router";
import { FiExternalLink } from "react-icons/fi";
import { useSelector } from "react-redux";

import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateImage,
  BlankSlateTitle,
} from "@/components/BlankSlate";
import { TextLink } from "@/components/TextLink";
import { usePromptToCreateContentExperiment } from "@/hooks/usePromptToCreateContentExperiment";
import { createDocumentsListEndpointFromRepoName } from "@/legacy/lib/utils/repo";
import { getRepoName } from "@/modules/environment";
import { SliceMachineStoreType } from "@/redux/type";

import { getBlankSlateContent } from "./getBlankSlateContent";

interface NoChangesBlankSlateProps {
  isPostPush: boolean;
}
export function NoChangesBlankSlate(props: NoChangesBlankSlateProps) {
  const { isPostPush } = props;

  const { eligible: isPromptToCreateContentExperimentEligible } =
    usePromptToCreateContentExperiment();

  const content = getBlankSlateContent(
    isPostPush,
    isPromptToCreateContentExperimentEligible,
  );

  const { repoName } = useSelector((state: SliceMachineStoreType) => ({
    repoName: getRepoName(state),
  }));

  const documentsListEndpoint =
    createDocumentsListEndpointFromRepoName(repoName);

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
                onClick={() => window.open(documentsListEndpoint, "_blank")}
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
