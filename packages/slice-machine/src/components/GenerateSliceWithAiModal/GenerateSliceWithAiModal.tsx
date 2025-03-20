import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  FileDropZone,
  FileUploadButton,
  ScrollArea,
} from "@prismicio/editor-ui";
import { useState } from "react";

import { Slice, SliceCard } from "./SliceCard";

interface GenerateSliceWithAiModalProps {
  open: boolean;
  onClose: () => void;
}

export function GenerateSliceWithAiModal(props: GenerateSliceWithAiModalProps) {
  const { open, onClose } = props;
  const [slices, setSlices] = useState<Slice[]>([]);

  const onImagesSelected = (images: File[]) => {
    setSlices(
      images.map((image) => ({
        status: "loading",
        image,
      })),
    );

    images.forEach((image, index) => {
      mockApiCall(image)
        .then((response) => {
          setSlices((slices) =>
            slices.map((slice, i) =>
              i === index
                ? {
                    ...slice,
                    ...response,
                  }
                : slice,
            ),
          );
        })
        .catch((error) => {
          setSlices((slices) =>
            slices.map((slice, i) =>
              i === index
                ? {
                    ...slice,
                    status: "error",
                  }
                : slice,
            ),
          );
          console.error("Error uploading image", error);
        });
    });
  };

  const allSlicesReady =
    slices.length > 0 && slices.every((slice) => slice.status === "success");

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setSlices([]);
        }
      }}
    >
      <DialogHeader title="Generate with AI" />
      <DialogContent gap={0}>
        <DialogDescription hidden>
          Upload images to generate slices with AI
        </DialogDescription>
        {slices.length === 0 ? (
          <Box padding={16} height="100%">
            <FileDropZone
              onFilesSelected={onImagesSelected}
              assetType="image"
              overlay={
                <UploadBlankSlate
                  onFilesSelected={onImagesSelected}
                  droppingFiles
                />
              }
            >
              <UploadBlankSlate onFilesSelected={onImagesSelected} />
            </FileDropZone>
          </Box>
        ) : (
          <ScrollArea>
            <Box padding={16} height="100%" gap={16}>
              {slices.map((slice, index) => (
                <SliceCard slice={slice} key={`slice-${index}`} />
              ))}
            </Box>
          </ScrollArea>
        )}

        <DialogActions>
          <DialogCancelButton />
          <DialogActionButton
            disabled={!allSlicesReady}
            onClick={() => undefined}
          >
            Add to page
          </DialogActionButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

function UploadBlankSlate(props: {
  droppingFiles?: boolean;
  onFilesSelected: (files: File[]) => void;
}) {
  const { droppingFiles = false, onFilesSelected } = props;

  return (
    <Box
      justifyContent="center"
      flexDirection="column"
      height="100%"
      backgroundColor={droppingFiles ? "purple2" : "grey2"}
      border
      borderStyle="dashed"
    >
      <BlankSlate>
        <BlankSlateIcon
          lineColor="purple11"
          backgroundColor="purple5"
          name="cloudUpload"
          size="large"
        />
        <BlankSlateTitle>Upload your design images.</BlankSlateTitle>
        <BlankSlateDescription>
          Once uploaded, you can generate slices automatically using AI.
        </BlankSlateDescription>
        <BlankSlateActions>
          <FileUploadButton
            startIcon="attachFile"
            onFilesSelected={onFilesSelected}
            color="grey"
          >
            Add images
          </FileUploadButton>
        </BlankSlateActions>
      </BlankSlate>
    </Box>
  );
}

function mockApiCall(image: File) {
  return new Promise<Slice>((resolve) => {
    setTimeout(
      () => {
        resolve({
          thumbnailUrl:
            "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=512",
          image,
          status: "success",
        });
      },
      2000 + Math.random() * 2000,
    );
  });
}
