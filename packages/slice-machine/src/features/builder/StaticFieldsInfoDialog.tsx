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
import { ReactNode, useState } from "react";

interface StaticFieldsInfoDialogProps {
  onClose: () => void;
  trigger?: ReactNode;
}

export function StaticFieldsInfoDialog(props: StaticFieldsInfoDialogProps) {
  const { onClose, trigger } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dismissDialog();
    } else {
      setIsOpen(open);
    }
  };

  function dismissDialog() {
    setIsOpen(false);
    onClose();
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      size="small"
    >
      <DialogHeader title={DIALOG_CONTENT.header} />
      <DialogContent>
        <ScrollArea>
          <Box as="article" flexDirection="column" padding={16} gap={4}>
            <Text sx={{ marginBottom: 4 }} color="purple9" variant="smallBold">
              {DIALOG_CONTENT.subtitle}
            </Text>
            <Text variant="h3">{DIALOG_CONTENT.title}</Text>
            <Text color="grey11">{DIALOG_CONTENT.description}</Text>
            <Video
              src={DIALOG_CONTENT.videoUrl}
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
          onClick={dismissDialog}
        >
          {DIALOG_CONTENT.buttonLabel}
        </DialogActionButton>
      </DialogActions>
    </Dialog>
  );
}

const DIALOG_CONTENT = {
  header: "Static zone",
  buttonLabel: "Got it",
  subtitle: "About",
  title: "What is the Static zone",
  description:
    "The static zone in Prismic page types contain fields that are always present on the page. Use it for essential information like a page's title, page design settings or metadata. Unlike slices, which can be added or removed, static zone fields remain fixed.",
  videoUrl:
    "https://res.cloudinary.com/dmtf1daqp/video/upload/v1723540305/DEV_TOOLS/STATES/Explication_vide%CC%81o_zone_statique_phibeq.mp4",
};
