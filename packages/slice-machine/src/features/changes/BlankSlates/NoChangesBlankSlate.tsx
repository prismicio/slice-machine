import { createDocumentsListEndpointFromRepoName } from "@lib/utils/repo";
import { Button, Image, tokens } from "@prismicio/editor-ui";
import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateImage,
  BlankSlateTitle,
} from "@src/components/BlankSlate";
import { TextLink } from "@src/components/TextLink";
import { getRepoName } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import router from "next/router";
import { FiExternalLink } from "react-icons/fi";
import { useSelector } from "react-redux";

export const NoChangesBlankSlate = () => {
  const { repoName } = useSelector((state: SliceMachineStoreType) => ({
    repoName: getRepoName(state),
  }));

  const documentsListEndpoint =
    createDocumentsListEndpointFromRepoName(repoName);

  return (
    <BlankSlate style={{ alignSelf: "center", marginTop: tokens.size[72] }}>
      <BlankSlateImage>
        <Image src="/blank-slate-changes-uptodate.png" sizing="cover" />
      </BlankSlateImage>
      <BlankSlateContent>
        <BlankSlateTitle>Everything up-to-date</BlankSlateTitle>
        <BlankSlateDescription>
          You have no changes staged. Your changes appear here after you have
          saved them, while they're waiting to be pushed to the Page Builder.
          Ready to get going?
        </BlankSlateDescription>
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
      </BlankSlateContent>
    </BlankSlate>
  );
};
