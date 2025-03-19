import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
  FileDropZone,
  FileUploadButton,
} from "@prismicio/editor-ui";

interface GenerateSliceWithAiModalProps {
  open: boolean;
  onClose: () => void;
}

export function GenerateSliceWithAiModal(props: GenerateSliceWithAiModalProps) {
  const { open, onClose } = props;

  const onImagesSelected = (images: File[]) => {
    console.log(images);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogHeader title="Generate with AI" />
      <DialogContent gap={0}>
        <Box padding={16} height="100%">
          <FileDropZone
            onFilesSelected={onImagesSelected}
            assetType="image"
            overlay={
              <UploadBlankSlate
                onFilesSelected={onImagesSelected}
                droppingFiles
              />
            }
          >
            <UploadBlankSlate onFilesSelected={onImagesSelected} />
          </FileDropZone>
        </Box>

        <DialogActions>
          <DialogCancelButton />
          <DialogActionButton disabled onClick={() => undefined}>
            Add to page
          </DialogActionButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

function UploadBlankSlate(props: {
  droppingFiles?: boolean;
  onFilesSelected: (files: File[]) => void;
}) {
  const { droppingFiles = false, onFilesSelected } = props;

  return (
    <Box
      justifyContent="center"
      flexDirection="column"
      height="100%"
      backgroundColor={droppingFiles ? "purple2" : "grey2"}
      border
      borderStyle="dashed"
    >
      <BlankSlate>
        <BlankSlateIcon
          lineColor="purple11"
          backgroundColor="purple5"
          name="cloudUpload"
          size="large"
        />
        <BlankSlateTitle>Upload your design images.</BlankSlateTitle>
        <BlankSlateDescription>
          Once uploaded, you can generate slices automatically using AI.
        </BlankSlateDescription>
        <BlankSlateActions>
          <FileUploadButton
            startIcon="attachFile"
            onFilesSelected={onFilesSelected}
            color="grey"
          >
            Add images
          </FileUploadButton>
        </BlankSlateActions>
      </BlankSlate>
    </Box>
  );
}
