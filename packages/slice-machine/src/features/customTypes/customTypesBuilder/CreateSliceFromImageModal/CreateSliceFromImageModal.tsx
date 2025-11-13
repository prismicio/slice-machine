import {
  BlankSlate,
  BlankSlateIcon,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  FileDropZone,
  FileUploadButton,
  ScrollArea,
  Text,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "react-toastify";
import { z } from "zod";

import { getState, telemetry } from "@/apiClient";
import { addAiFeedback } from "@/features/aiFeedback";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { FigmaIcon } from "@/icons/FigmaIcon";
import { managerClient } from "@/managerClient";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { Slice, SliceCard } from "./SliceCard";

const clipboardDataSchema = z.object({
  __type: z.literal("figma-to-prismic/clipboard-data"),
  name: z.string(),
  image: z.string().startsWith("data:image/"),
});

const IMAGE_UPLOAD_LIMIT = 10;

interface CreateSliceFromImageModalProps {
  open: boolean;
  location: "custom_type" | "page_type" | "slices";
  onSuccess: (args: {
    slices: {
      model: SharedSlice;
      langSmithUrl?: string;
    }[];
    library: string;
  }) => void;
  onClose: () => void;
}

export function CreateSliceFromImageModal(
  props: CreateSliceFromImageModalProps,
) {
  const { open, location, onClose } = props;
  const [slices, setSlices] = useState<Slice[]>([]);
  const { syncChanges } = useAutoSync();
  const { createSliceSuccess } = useSliceMachineActions();
  const { completeStep } = useOnboarding();
  const existingSlices = useExistingSlices({ open });

  /**
   * Keeps track of the current instance id.
   * When the modal is closed, the id is reset.
   */
  const id = useRef(crypto.randomUUID());

  useHotkeys(
    ["meta+v", "ctrl+v"],
    (event) => {
      event.preventDefault();
      void handlePaste();
    },
    { enabled: open },
  );

  useEffect(() => {
    if (slices.every((slice) => slice.status === "success")) {
      void onAllComplete();
    }
  }, [slices]); // eslint-disable-line react-hooks/exhaustive-deps

  const setSlice = (args: {
    index: number;
    slice: (prevSlice: Slice) => Slice;
  }) => {
    const { index, slice } = args;
    setSlices((slices) => slices.map((s, i) => (i === index ? slice(s) : s)));
  };

  const onOpenChange = (open: boolean) => {
    if (open) return;
    onClose();
    id.current = crypto.randomUUID();
    setSlices([]);
  };

  const onImagesSelected = (images: File[]) => {
    if (images.length > IMAGE_UPLOAD_LIMIT) {
      toast.error(
        `You can only upload ${IMAGE_UPLOAD_LIMIT} images at a time.`,
      );
      return;
    }

    setSlices(
      images.map((image) => ({
        status: "uploading",
        source: "upload",
        image,
      })),
    );

    images.forEach((imageData, index) => {
      void generateSlice({ index, imageData, source: "upload" });
    });
  };

  const handlePaste = async () => {
    // Limit just to one paste at a time for now
    if (!open || slices.length > 0) return;

    const supportsClipboardRead =
      typeof navigator.clipboard?.read === "function";

    if (!supportsClipboardRead) {
      toast.error("Clipboard paste is not supported in this browser.");
      return;
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      if (clipboardItems.length === 0) {
        toast.error("No data found in clipboard.");
        return;
      }

      let imageName = "pasted-image.png";
      let imageBlob: Blob | null = null;
      let success = false;

      // Method 1: Try to extract image from clipboard image/png blob (preferred)
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType !== undefined) {
          imageBlob = await item.getType(imageType);
          break;
        }
      }

      // Method 2: Read JSON from text/plain to get metadata and base64 image as fallback
      for (const item of clipboardItems) {
        if (item.types.includes("text/plain")) {
          try {
            const textBlob = await item.getType("text/plain");
            const text = await textBlob.text();

            const result = clipboardDataSchema.safeParse(JSON.parse(text));
            if (result.success) {
              success = true;
              const data = result.data;
              imageName = `${data.name}.png`;

              // Use base64 image as fallback if no blob was found
              if (!imageBlob) {
                const response = await fetch(data.image);
                imageBlob = await response.blob();
              }
            } else {
              console.warn("Clipboard data validation failed:", result.error);
            }
          } catch (error) {
            console.warn("Failed to parse JSON from clipboard:", error);
            // Continue - we may still have imageBlob from Method 1
          }
        }
      }

      if (!imageBlob) {
        if (success) {
          toast.error(
            "Could not extract Figma data from clipboard. Please try copying again using the Prismic Figma plugin.",
          );
        } else {
          toast.error(
            "No Figma data found in clipboard. Make sure you've copied a design using the Prismic Figma plugin.",
          );
        }
        return;
      }

      // Check if we're at the limit
      const currentSliceCount = slices.length;
      if (currentSliceCount >= IMAGE_UPLOAD_LIMIT) {
        toast.error(
          `You can only upload ${IMAGE_UPLOAD_LIMIT} images at a time.`,
        );
        return;
      }

      // Create File object from blob and append to existing slices
      const imageData = new File([imageBlob], imageName, {
        type: imageBlob.type,
      });
      const newIndex = currentSliceCount;

      // Append new slice to existing ones
      setSlices((prevSlices) => [
        ...prevSlices,
        {
          source: "figma",
          status: "uploading",
          image: imageData,
        },
      ]);

      // Start uploading the new image
      void generateSlice({ index: newIndex, imageData, source: "figma" });

      toast.success(`Pasted ${imageName}${success ? " from Figma" : ""}`);
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
      toast.error(
        "Failed to paste from clipboard. Please check browser permissions and try again.",
      );
    }
  };

  const generateSlice = async (args: {
    index: number;
    imageData: File;
    source: "figma" | "upload";
  }) => {
    const { index, imageData, source } = args;
    const currentId = id.current;

    const smConfig = await managerClient.project.getSliceMachineConfig();
    const libraryID = smConfig?.libraries?.[0];
    if (libraryID === undefined) {
      throw new Error("No library found in the config.");
    }

    setSlice({
      index,
      slice: (prevSlice) => ({ ...prevSlice, status: "uploading" }),
    });

    try {
      const imageUrl = await getImageUrl({ image: imageData });
      if (currentId !== id.current) return;

      void inferSlice({ index, imageUrl, libraryID, source });
    } catch {
      if (currentId !== id.current) return;
      setSlice({
        index,
        slice: (prevSlice) => ({
          ...prevSlice,
          status: "uploadError",
          onRetry: () => void generateSlice({ index, imageData, source }),
        }),
      });
    }
  };

  const inferSlice = async (args: {
    index: number;
    imageUrl: string;
    libraryID: string;
    source: "figma" | "upload";
  }) => {
    const { index, imageUrl, libraryID, source } = args;
    const currentId = id.current;

    setSlice({
      index,
      slice: (prevSlice) => ({
        ...prevSlice,
        status: "generating",
        thumbnailUrl: imageUrl,
      }),
    });

    try {
      const inferResult = await managerClient.customTypes.inferSlice({
        source,
        libraryID,
        imageUrl,
      });

      if (currentId !== id.current) return;

      setSlices((prevSlices) => {
        return prevSlices.map((prevSlice, i) => {
          if (i !== index) return prevSlice;
          return {
            ...prevSlice,
            status: "success",
            thumbnailUrl: imageUrl,
            model: sliceWithoutConflicts({
              existingSlices: existingSlices.current,
              newSlices: slices,
              slice: inferResult.slice,
            }),
          };
        });
      });
    } catch {
      if (currentId !== id.current) return;
      setSlice({
        index,
        slice: (prevSlice) => ({
          ...prevSlice,
          status: "generateError",
          thumbnailUrl: imageUrl,
          onRetry: () => {
            void inferSlice({ index, imageUrl, libraryID, source });
          },
        }),
      });
    }
  };

  const onAllComplete = async () => {
    const newSlices = slices.reduce<NewSlice[]>((acc, slice) => {
      if (slice.status === "success") {
        acc.push(slice);
      }
      return acc;
    }, []);

    if (!newSlices.length) return;

    const currentId = id.current;
    try {
      // Only the slices generated from uploaded images need this step
      const { slices, library } = await addSlices(
        newSlices.filter((slice) => slice.source === "upload"),
      );
      if (currentId !== id.current) return;

      id.current = crypto.randomUUID();

      const serverState = await getState();
      createSliceSuccess(serverState.libraries);
      syncChanges();

      void completeStep("createSlice");

      for (const { model, langSmithUrl } of slices) {
        void telemetry.track({
          event: "slice:created",
          id: model.id,
          name: model.name,
          library,
          location,
          mode: "ai",
          langSmithUrl,
        });

        addAiFeedback({
          type: "model",
          library,
          sliceId: model.id,
          variationId: model.variations[0].id,
          langSmithUrl,
        });
      }

      toast.success(
        `${newSlices.length} new slice${
          newSlices.length > 1 ? "s" : ""
        } successfully generated.`,
      );
    } catch {
      if (currentId !== id.current) return;
      toast.error("An unexpected error happened while adding slices.");
    }
  };

  const areSlicesLoading = slices.some(
    (slice) => slice.status === "uploading" || slice.status === "generating",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader title="Generate from image" />
      <DialogContent gap={0}>
        <DialogDescription hidden>
          Upload images to generate slices with AI
        </DialogDescription>
        {slices.length === 0 ? (
          <Box
            padding={16}
            height="100%"
            gap={16}
            display="flex"
            flexDirection="column"
          >
            <Box
              display="flex"
              gap={16}
              alignItems="center"
              backgroundColor="grey2"
              padding={16}
              borderRadius={12}
            >
              <Box display="flex" gap={8} alignItems="center" flexGrow={1}>
                <Box
                  width={48}
                  height={48}
                  backgroundColor="grey12"
                  borderRadius="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FigmaIcon variant="original" height={25} />
                </Box>
                <Box display="flex" flexDirection="column" flexGrow={1}>
                  <Text variant="bold">Want to work faster?</Text>
                  <Text variant="small" color="grey11">
                    Copy frames from Figma with the Slice Machine plugin and
                    paste them here.
                  </Text>
                </Box>
              </Box>
              <Button
                endIcon="arrowForward"
                color="indigo"
                onClick={() =>
                  window.open(
                    "https://www.figma.com/community/plugin/TODO",
                    "_blank",
                  )
                }
                sx={{ marginRight: 8 }}
                invisible
              >
                Install plugin
              </Button>
            </Box>
            <FileDropZone
              onFilesSelected={onImagesSelected}
              assetType="image"
              maxFiles={IMAGE_UPLOAD_LIMIT}
              overlay={
                <UploadBlankSlate
                  onFilesSelected={onImagesSelected}
                  onPaste={() => void handlePaste()}
                  droppingFiles
                />
              }
            >
              <UploadBlankSlate
                onFilesSelected={onImagesSelected}
                onPaste={() => void handlePaste()}
              />
            </FileDropZone>
          </Box>
        ) : (
          <ScrollArea stableScrollbar={false}>
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr"
              gap={16}
              padding={16}
            >
              {slices.map((slice, index) => (
                <SliceCard slice={slice} key={`slice-${index}`} />
              ))}
            </Box>
          </ScrollArea>
        )}

        <DialogActions>
          <DialogCancelButton disabled={areSlicesLoading}>
            Close
          </DialogCancelButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

function UploadBlankSlate(props: {
  droppingFiles?: boolean;
  onFilesSelected: (files: File[]) => void;
  onPaste: () => void;
}) {
  const { droppingFiles = false, onFilesSelected, onPaste } = props;

  return (
    <Box
      justifyContent="center"
      flexDirection="column"
      height="100%"
      backgroundColor={droppingFiles ? "purple2" : "grey2"}
      border
      borderStyle="dashed"
      borderColor={droppingFiles ? "purple9" : "grey6"}
      borderRadius={12}
      flexGrow={1}
    >
      <BlankSlate>
        <Box display="flex" flexDirection="column" gap={16} alignItems="center">
          <BlankSlateIcon
            lineColor="purple11"
            backgroundColor="purple5"
            name="cloudUpload"
            size="large"
          />
          <Box
            display="flex"
            flexDirection="column"
            gap={4}
            alignItems="center"
          >
            <Text>Generate slices from your designs</Text>
            <Text variant="small" color="grey11">
              Upload your design images or paste them directly from Figma.
            </Text>
          </Box>
          <Box display="flex" alignItems="center" gap={16}>
            <Button
              size="small"
              renderStartIcon={() => (
                <FigmaIcon variant="original" height={16} />
              )}
              color="grey"
              onClick={onPaste}
            >
              Paste from Figma
            </Button>
            <FileUploadButton
              size="small"
              onFilesSelected={onFilesSelected}
              color="purple"
              invisible
            >
              Add images
            </FileUploadButton>
          </Box>
        </Box>
      </BlankSlate>
    </Box>
  );
}

async function getImageUrl({ image }: { image: File }) {
  const repository = await managerClient.project.getResolvedRepositoryName();
  // ACL provider only allows key prefixes starting with "<repository>/shared-slices/"
  const keyPrefix = [
    repository,
    "shared-slices",
    "prismic-inferred-slices",
    crypto.randomUUID(),
  ].join("/");
  await managerClient.screenshots.initS3ACL();
  const { url } = await managerClient.screenshots.uploadScreenshot({
    keyPrefix,
    data: image,
  });
  return url;
}

type NewSlice = {
  image: File;
  model: SharedSlice;
  langSmithUrl?: string;
  source: "figma" | "upload";
};

/**
 * Keeps track of the existing slices in the project.
 * Re-fetches them when the modal is opened.
 */
function useExistingSlices({ open }: { open: boolean }) {
  const ref = useRef<SharedSlice[]>([]);

  useEffect(() => {
    if (!open) return;

    ref.current = [];
    managerClient.slices
      .readAllSlices()
      .then((slices) => {
        ref.current = slices.models.map(({ model }) => model);
      })
      .catch(() => null);
  }, [open]);

  return ref;
}

/**
 * If needed, assigns new ids and names to avoid conflicts with existing slices.
 * Names are compared case-insensitively to avoid conflicts
 * between folder names with different casing.
 */
function sliceWithoutConflicts({
  existingSlices,
  newSlices,
  slice,
}: {
  existingSlices: SharedSlice[];
  newSlices: Slice[];
  slice: SharedSlice;
}): SharedSlice {
  const existingIds = new Set<string>();
  const existingNames = new Set<string>();

  for (const { id, name } of existingSlices) {
    existingIds.add(id);
    existingNames.add(name.toLowerCase());
  }

  for (const slice of newSlices) {
    if (slice.status !== "success") continue;
    existingIds.add(slice.model.id);
    existingNames.add(slice.model.name.toLowerCase());
  }

  let id = slice.id;
  let counter = 2;
  while (existingIds.has(id)) {
    id = `${slice.id}_${counter}`;
    counter++;
  }

  let name = slice.name;
  counter = 2;
  while (existingNames.has(name.toLowerCase())) {
    name = `${slice.name}${counter}`;
    counter++;
  }

  return {
    ...slice,
    id,
    name,
  };
}

async function addSlices(newSlices: NewSlice[]) {
  // use the first library
  const { libraries = [] } =
    await managerClient.project.getSliceMachineConfig();
  const library = libraries[0];
  if (!library) {
    throw new Error("No library found in the config.");
  }

  for (const { model } of newSlices) {
    const { errors } = await managerClient.slices.createSlice({
      libraryID: library,
      model,
    });
    if (errors.length) {
      throw new Error(`Failed to create slice ${model.id}.`);
    }
  }

  // for each added slice, set the variation screenshot
  const slices = await Promise.all(
    newSlices.map(async ({ model, image, langSmithUrl }) => {
      await managerClient.slices.updateSliceScreenshot({
        libraryID: library,
        sliceID: model.id,
        variationID: model.variations[0].id,
        data: image,
      });
      return {
        model,
        langSmithUrl,
      };
    }),
  );

  return { library, slices };
}
