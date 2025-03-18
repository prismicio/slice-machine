import {
  Box,
  Dialog,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
} from "@prismicio/editor-ui";

interface GenerateSliceWithAiModalProps {
  onClose: () => void;
}

export function GenerateSliceWithAiModal(props: GenerateSliceWithAiModalProps) {
  const { onClose } = props;

  return (
    <Dialog open onOpenChange={onClose}>
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
