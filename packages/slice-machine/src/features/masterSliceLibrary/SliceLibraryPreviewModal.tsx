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

type MasterSliceLibraryPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MasterSliceLibraryPreviewModal: React.FC<
  MasterSliceLibraryPreviewModalProps
> = ({ isOpen, onClose }) => {
  const { masterSliceLibrary } = useMarketingContent();

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
      <DialogHeader title="Master Slice Library Generator (BETA)" />
      <DialogContent>
        <Box flexDirection="column" padding={16} gap={16}>
          <Text variant="h2">Create a Master Slice Library</Text>
          <Video src={previewVideoUrl} sizing="contain" autoPlay loop />
          <Text>
            This is an{" "}
            <a href={exampleLinkUrl} target="_blank">
              example slice library
            </a>
            ,  which provides you with an overview of all your slices in one
            place. Build it yourself in a few steps.
          </Text>
          <Button size="large" onClick={onGetTheCodeButtonClick}>
            Get the code
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
