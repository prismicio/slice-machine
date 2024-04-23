import {
  Box,
  Dialog,
  DialogContent,
  DialogHeader,
  IconButton,
  ScrollArea,
  Separator,
  Text,
  Video,
} from "@prismicio/editor-ui";
import { FC } from "react";

import { Count } from "@/components/Count";
import { useIsEmptyProject } from "@/hooks/useIsEmptyProject";
import { HelpIcon } from "@/icons/HelpIcon";

import { useInAppGuideContent } from "./inAppGuideContent";
import { useInAppGuide } from "./InAppGuideContext";

export const InAppGuideDialog: FC = () => {
  const isEmptyProject = useIsEmptyProject();
  const { isInAppGuideOpen, setIsInAppGuideOpen } = useInAppGuide();
  const inAppGuideContent = useInAppGuideContent();

  const trigger =
    isEmptyProject === false ? (
      <Box position="fixed" right={16} bottom={16}>
        <IconButton
          color="purple"
          icon={<HelpIcon />}
          onClick={() => {
            setIsInAppGuideOpen(!isInAppGuideOpen);
          }}
          radius="full"
          variant="solid"
        />
      </Box>
    ) : undefined;

  return (
    <Dialog
      trigger={trigger}
      modal={false}
      open={isInAppGuideOpen && isEmptyProject === false}
      onOpenChange={(open) => {
        setIsInAppGuideOpen(open);
      }}
      position="bottomRight"
      size={{
        width: 360,
        height: 456,
      }}
    >
      <DialogHeader title={inAppGuideContent.title} />
      <DialogContent>
        <ScrollArea>
          <Box flexDirection="column" padding={{ inline: 16, block: 8 }}>
            <Text>{inAppGuideContent.description}</Text>
          </Box>

          <Box>
            <Separator />
          </Box>

          {inAppGuideContent.steps.map((content, index) => (
            <Box key={index} flexDirection="column">
              <Box flexDirection="column" padding={16} gap={8}>
                <Box alignItems="center" gap={8}>
                  <Count>{index + 1}</Count>
                  <Text component="h3" variant="bold">
                    {content.title}
                  </Text>
                </Box>
                <Video src={content.videoUrl} sizing="contain" autoPlay loop />
                <Text>{content.description}</Text>
              </Box>

              <Separator />
            </Box>
          ))}

          <Box flexDirection="column" padding={16} gap={4}>
            <Text variant="bold">{inAppGuideContent.successTitle}</Text>
            <Text>{inAppGuideContent.successDescription}</Text>
          </Box>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
