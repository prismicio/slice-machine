import { FC } from "react";
import { Button } from "@prismicio/editor-ui";

import { useInAppGuide } from "./InAppGuideContext";

// TODO: Waiting for Design
export const InAppGuideTrigger: FC = () => {
  const { isInAppGuideOpen, setIsInAppGuideOpen } = useInAppGuide();

  return (
    <Button
      size="small"
      sx={{ marginTop: 16 }}
      onClick={() => {
        setIsInAppGuideOpen(!isInAppGuideOpen);
      }}
    >
      {isInAppGuideOpen ? "Close In-App Guide" : "Open In-App Guide"}
    </Button>
  );
};
