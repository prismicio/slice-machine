import { FC } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogHeader,
  ScrollArea,
  Separator,
  Text,
  Video,
} from "@prismicio/editor-ui";

import { Counter } from "@src/components/Counter";
import { FlowerBackgroundIcon } from "@src/icons/FlowerBackgroundIcon";

import { IN_APP_GUIDE_CONTENT } from "./inAppGuideContent";
import { useInAppGuide } from "./InAppGuideContext";

export const InAppGuideDialog: FC = () => {
  const { isInAppGuideOpen, setIsInAppGuideOpen } = useInAppGuide();

  return (
    <Dialog
      modal={false}
      open={isInAppGuideOpen}
      onOpenChange={(open) => {
        setIsInAppGuideOpen(open);
      }}
      position="bottomRight"
      size={{
        width: 360,
        height: 368,
      }}
    >
      <DialogHeader title="Learn Prismic" />
      <DialogContent>
        <ScrollArea>
          <Box flexDirection="column" padding={16} gap={4}>
            <Text variant="bold">Build your first page in 5 minutes</Text>
            <Text color="grey11">
              Embark on your web development journey with our easy-to-follow
              steps from design to live preview.
            </Text>
          </Box>

          {IN_APP_GUIDE_CONTENT.map((content, index) => (
            <Box key={index} flexDirection="column">
              <Separator />

              <Box flexDirection="column" padding={16} gap={8}>
                <Box alignItems="center" gap={8}>
                  <Counter backgroundIcon={<FlowerBackgroundIcon />}>
                    {index + 1}
                  </Counter>
                  <Text component="h3" variant="bold">
                    {content.title}
                  </Text>
                </Box>
                <Video
                  src={content.videoUrl}
                  sizing="contain"
                  autoPlay
                  controls
                  loop
                />
                <Text>{content.description}</Text>
              </Box>
            </Box>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
