import {
  Box,
  Dialog,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
} from "@prismicio/editor-ui";

interface GenerateSliceWithAiModalProps {
  open: boolean;
  onClose: () => void;
}

export function GenerateSliceWithAiModal(props: GenerateSliceWithAiModalProps) {
  const { open, onClose } = props;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogHeader title="Generate with AI" />
      <DialogContent gap={0}>
        <Box height="100%" />
        <DialogActions>
          <DialogCancelButton />
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
