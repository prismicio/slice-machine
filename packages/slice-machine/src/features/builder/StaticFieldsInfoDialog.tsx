import {
  Box,
  Button,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogContent,
  DialogHeader,
  ScrollArea,
  Text,
  Video,
} from "@prismicio/editor-ui";
import { useState } from "react";

interface StaticFieldsInfoDialogProps {
  onClose: () => void;
}

export function StaticFieldsInfoDialog(props: StaticFieldsInfoDialogProps) {
  const { onClose } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dismissDialog();
      return;
    }
    setIsOpen(open);
  };

  function dismissDialog() {
    setIsOpen(false);
    onClose();
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <Button
          startIcon="add"
          color="grey"
          data-testid="static-fields-info-trigger"
        />
      }
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

// TODO: add validated content when ready
const DIALOG_CONTENT = {
  header: "About static fields",
  buttonLabel: "Got it",
  subtitle: "About",
  title: "Static fields",
  description:
    "<b>Static fields</b> in Prismic page Types represent a dedicated section where editors can edit fields that will always be present on the page. Unlike Slices, which are optional and can be added or removed to customize the content layout, static fields ensures that certain essential information is consistently present for every version of the Page, like page metadata for example.",
  videoUrl:
    "https://res.cloudinary.com/dmtf1daqp/video/upload/v1721918320/DEV_TOOLS/ONBOARDING_GUIDE/Create_page_type_xdn13j.mp4",
};
