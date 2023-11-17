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
  vars,
} from "@prismicio/editor-ui";

import { Counter } from "@src/components/Counter";
import { FlowerBackgroundIcon } from "@src/icons/FlowerBackgroundIcon";
import { HelpIcon } from "@src/icons/HelpIcon";
import { useIsEmptyProject } from "@src/hooks/useIsEmptyProject";
import { useRepositoryInformation } from "@src/hooks/useRepositoryInformation";

import { IN_APP_GUIDE_CONTENT } from "./inAppGuideContent";
import { useInAppGuide } from "./InAppGuideContext";

export const InAppGuideDialog: FC = () => {
  const isEmptyProject = useIsEmptyProject();
  const { isInAppGuideOpen, setIsInAppGuideOpen } = useInAppGuide();
  const { repositoryUrl } = useRepositoryInformation();

  // TODO: Use new IconButton component from editor-ui
  const trigger =
    isEmptyProject === false ? (
      <Box position="fixed" right={16} bottom={16}>
        <button
          style={{
            all: "unset",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "50%",
            backgroundColor: vars.color.greyDark1,
            border: `1px solid ${vars.color.greyDark6}`,
            height: 32,
            width: 32,
          }}
          onClick={() => {
            setIsInAppGuideOpen(!isInAppGuideOpen);
          }}
        >
          <HelpIcon />
        </button>
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
        height: 440,
      }}
    >
      <DialogHeader title={IN_APP_GUIDE_CONTENT.title} />
      <DialogContent>
        <ScrollArea>
          {IN_APP_GUIDE_CONTENT.steps.map((content, index) => (
            <Box key={index} flexDirection="column">
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
                <Text>
                  {typeof content.description === "function"
                    ? content.description(repositoryUrl)
                    : content.description}
                </Text>
              </Box>

              <Separator />
            </Box>
          ))}

          <Box flexDirection="column" padding={16} gap={4}>
            <Text variant="bold">{IN_APP_GUIDE_CONTENT.successTitle}</Text>
            <Box flexDirection="column">
              {IN_APP_GUIDE_CONTENT.successSteps.map((content, index) => (
                <Text key={index}>• {content}</Text>
              ))}
            </Box>
          </Box>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
