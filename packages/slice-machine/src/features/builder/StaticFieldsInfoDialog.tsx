import {
  Box,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogContent,
  DialogHeader,
  ScrollArea,
  Text,
  Video,
} from "@prismicio/editor-ui";

interface StaticFieldsInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function StaticFieldsInfoDialog(props: StaticFieldsInfoDialogProps) {
  const { open, onOpenChange, onConfirm } = props;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="small">
      <DialogHeader title="Static zone" />
      <DialogContent>
        <ScrollArea>
          <Box as="article" flexDirection="column" padding={16} gap={4}>
            <Text sx={{ marginBottom: 4 }} color="purple9" variant="smallBold">
              About
            </Text>
            <Text variant="h3">What is the static zone?</Text>
            <Text color="grey11">
              The static zone in Prismic page types contain fields that are
              always present on the page. Use it for essential information like
              a page's title, page design settings, or metadata. Unlike slices,
              which can be added or removed, static zone fields remain fixed.
            </Text>
            <Video
              src="https://res.cloudinary.com/dmtf1daqp/video/upload/v1723540305/DEV_TOOLS/STATES/Explication_vide%CC%81o_zone_statique_phibeq.mp4"
              sizing="contain"
              autoPlay
              loop
            />
          </Box>
        </ScrollArea>
      </DialogContent>
      <DialogActions>
        <DialogActionButton
          size="medium"
          sx={{ flexGrow: 1 }}
          onClick={handleConfirm}
        >
          Got it
        </DialogActionButton>
      </DialogActions>
    </Dialog>
  );
}
