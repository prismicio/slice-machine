import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@prismicio/editor-ui";
import { Video } from "cloudinary-react";
import React from "react";
import { Box, Button, Heading, Text } from "theme-ui";

import { telemetry } from "@/apiClient";
import { getSliceCreationOptions } from "@/features/customTypes/customTypesBuilder/sliceCreationOptions";

interface Props {
  title: string;
  onCreateNew: () => void;
  onCreateFromImage: () => void;
  onImportSlicesFromLibrary: () => void;
  buttonText: string;
  documentationComponent: React.ReactNode;
  videoPublicIdUrl: string;
}

const EmptyState: React.FunctionComponent<Props> = ({
  title,
  onCreateNew,
  onCreateFromImage,
  onImportSlicesFromLibrary,
  buttonText,
  documentationComponent,
  videoPublicIdUrl,
  ...restProps
}) => {
  const sliceCreationOptions = getSliceCreationOptions({
    menuType: "Dropdown",
  });

  return (
    <Box
      sx={{
        display: "flex",
        width: "80%",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
      {...restProps}
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
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                data-testid="empty-state-main-button"
                sx={{ flexShrink: 0, mr: 4 }}
              >
                {buttonText}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                renderStartIcon={() =>
                  sliceCreationOptions.fromImage.BackgroundIcon
                }
                onSelect={onCreateFromImage}
                description={sliceCreationOptions.fromImage.description}
              >
                {sliceCreationOptions.fromImage.title}
              </DropdownMenuItem>
              <DropdownMenuItem
                renderStartIcon={() =>
                  sliceCreationOptions.fromScratch.BackgroundIcon
                }
                onSelect={onCreateNew}
                description={sliceCreationOptions.fromScratch.description}
              >
                {sliceCreationOptions.fromScratch.title}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onImportSlicesFromLibrary}
                renderStartIcon={() =>
                  sliceCreationOptions.importFromExternal.BackgroundIcon
                }
                description={
                  sliceCreationOptions.importFromExternal.description
                }
              >
                {sliceCreationOptions.importFromExternal.title}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
};

export default EmptyState;
