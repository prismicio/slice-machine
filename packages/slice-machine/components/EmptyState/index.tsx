import { Button, Text, Heading, Box } from "theme-ui";
import React from "react";
import { Video } from "cloudinary-react";

import { telemetry } from "@src/apiClient";

interface Props {
  title: string;
  onCreateNew: () => void;
  buttonText: string;
  documentationComponent: React.ReactNode;
  videoPublicIdUrl: string;
}

const EmptyState: React.FunctionComponent<Props> = ({
  title,
  onCreateNew,
  buttonText,
  documentationComponent,
  videoPublicIdUrl,
}) => (
  <Box
    sx={{
      display: "flex",
      width: "80%",
      flexWrap: "wrap",
      justifyContent: "center",
    }}
  >
    <Box
      sx={(theme) => ({
        display: "flex",
        flex: 1,
        alignItems: "center",
        minWidth: "400px",
        maxWidth: "70%",
        border: `1px solid ${theme.colors?.grey02 as string}`,
      })}
    >
      <Video
        cloudName="dmtf1daqp"
        controls
        loop
        style={{
          maxWidth: "100%",
          objectFit: "contain",
        }}
        publicId={videoPublicIdUrl}
        onPlay={() => {
          void telemetry.track({
            event: "open-video-tutorials",
            video: videoPublicIdUrl,
          });
        }}
      />
    </Box>

    <Box
      sx={(theme) => ({
        bg: "white",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${theme.colors?.grey02 as string}`,
        flex: 1,
        minWidth: "400px",
        maxWidth: "70%",
      })}
    >
      <Box
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          p: 4,
          borderBottom: `1px solid ${theme.colors?.grey02 as string}`,
        })}
      >
        <Heading
          as="h3"
          variant={"heading"}
          sx={{ fontSize: "16px", lineHeight: "24px", mb: 2 }}
        >
          {title}
        </Heading>
        <Text variant="xs" sx={{ lineHeight: "24px", fontSize: "13px" }}>
          {documentationComponent}
        </Text>
      </Box>
      <Box
        sx={{
          display: "flex",
          p: 4,
          alignItems: "center",
        }}
      >
        <Button
          onClick={onCreateNew}
          data-cy="empty-state-main-button"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
            mr: 4,
          }}
        >
          {buttonText}
        </Button>
        <Text
          sx={{
            fontSize: "12px",
            color: "grey04",
            maxWidth: "280px",
          }}
        >
          It will be stored locally and you will be able to push it to your
          repository
        </Text>
      </Box>
    </Box>
  </Box>
);

export default EmptyState;
