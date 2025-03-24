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
  const [isCreatingSlices, setIsCreatingSlices] = useState(false);

  const setSlice = (args: { index: number; slice: Slice }) => {
    const { index, slice } = args;
    setSlices((slices) =>
      slices.map((s, i) => (i === index ? { ...s, ...slice } : s)),
    );
  };

  const uploadImage = (args: { index: number; image: File }) => {
    const { index, image } = args;

    setSlice({
      index,
      slice: {
        image,
        status: "uploading",
      },
    });

    mockUpload(image)
      .then((response) => {
        if (response.status === "error") throw new Error("Upload failed");

        setSlice({
          index,
          slice: {
            image,
            thumbnailUrl: response.imageUrl,
            status: "success",
          },
        });
      })
      .catch(() => {
        setSlice({
          index,
          slice: {
            image,
            status: "uploadError",
          },
        });
      });
  };
  const onImagesSelected = (images: File[]) => {
    setSlices(
      images.map((image) => ({
        status: "uploading",
        image,
      })),
    );

    images.forEach((image, index) => uploadImage({ index, image }));
  };

  const onSubmit = () => {
    setIsCreatingSlices(true);

    // Simulate Slice creation call
    setTimeout(() => {
      onClose();
      setSlices([]);
      setIsCreatingSlices(false);
    }, 2000);
  };

  const areSlicesLoading = slices.some((slice) => slice.status === "uploading");
  const readySlices = slices.filter((slice) => slice.status === "success");
  const someSlicesReady = readySlices.length > 0;

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
            <Box padding={16} height="100%" gap={16} flexWrap="wrap">
              {slices.map((slice, index) => (
                <SliceCard
                  slice={slice}
                  key={`slice-${index}`}
                  onRetry={
                    slice.status === "uploadError"
                      ? () => uploadImage({ index, image: slice.image })
                      : undefined
                  }
                />
              ))}
            </Box>
          </ScrollArea>
        )}

        <DialogActions>
          <DialogCancelButton disabled={isCreatingSlices} />
          <DialogActionButton
            disabled={!someSlicesReady || areSlicesLoading}
            loading={isCreatingSlices}
            onClick={onSubmit}
          >
            Add to page ({readySlices.length})
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
      borderColor={droppingFiles ? "purple9" : "grey6"}
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

function mockUpload(_image: File) {
  return new Promise<
    { imageUrl: string; status: "success" } | { status: "error" }
  >((resolve) => {
    setTimeout(
      () => {
        resolve(
          Math.random() > 0.2
            ? {
                imageUrl:
                  "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=512",
                status: "success",
              }
            : { status: "error" },
        );
      },
      1000 + Math.random() * 2000,
    );
  });
}
