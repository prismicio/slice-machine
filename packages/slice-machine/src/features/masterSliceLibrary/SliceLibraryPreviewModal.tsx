import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  Text,
  Video,
} from "@prismicio/editor-ui";

import { telemetry } from "@/apiClient";
import { useMarketingContent } from "@/hooks/useMarketingContent";

import { useSectionsExperiment } from "../builder/useSectionsExperiment";

type MasterSliceLibraryPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MasterSliceLibraryPreviewModal: React.FC<
  MasterSliceLibraryPreviewModalProps
> = ({ isOpen, onClose }) => {
  const { masterSliceLibrary } = useMarketingContent();
  const sectionsExperiment = useSectionsExperiment();

  if (!masterSliceLibrary) return null;

  const { exampleLinkUrl, codeLinkUrl, previewVideoUrl } = masterSliceLibrary;
  const onGetTheCodeButtonClick = () => {
    void telemetry.track({
      event: "slice-library:beta:code-opened",
    });

    window.open(codeLinkUrl, "_blank");
  };

  return (
    <Dialog
      size="small"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogHeader
        title={`Master ${sectionsExperiment.singular.uppercase} Library Generator (BETA)`}
      />
      <DialogContent>
        <Box flexDirection="column" padding={16} gap={16}>
          <Text variant="h2">
            Create a Master {sectionsExperiment.singular.uppercase} Library
          </Text>
          <Video src={previewVideoUrl} sizing="contain" autoPlay loop />
          <Text>
            This is an{" "}
            <a href={exampleLinkUrl} target="_blank">
              example {sectionsExperiment.singular.lowercase} library
            </a>
            , which provides you with an overview of all your{" "}
            {sectionsExperiment.plural.lowercase} in one place. Build it
            yourself in a few steps.
          </Text>
          <Button size="large" onClick={onGetTheCodeButtonClick}>
            Get the code
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
