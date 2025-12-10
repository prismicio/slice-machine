import { useStableCallback } from "@prismicio/editor-support/React";
import {
  BlankSlate,
  BlankSlateIcon,
  Box,
  Button,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  FileDropZone,
  FileUploadButton,
  ProgressCircle,
  ScrollArea,
  Text,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "react-toastify";
import { z } from "zod";

import { getState, telemetry } from "@/apiClient";
import { addAiFeedback } from "@/features/aiFeedback";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { useExperimentVariant } from "@/hooks/useExperimentVariant";
import { FigmaIcon } from "@/icons/FigmaIcon";
import { managerClient } from "@/managerClient";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { Slice, SliceCard } from "./SliceCard";

const IMAGE_UPLOAD_LIMIT = 10;

interface CreateSliceFromImageModalProps {
  open: boolean;
  location: "custom_type" | "page_type" | "slices";
  onSuccess: (args: { slices: SharedSlice[]; library: string }) => void;
  onClose: () => void;
}

const clipboardDataSchema = z.object({
  __type: z.literal("figma-to-prismic/clipboard-data"),
  name: z.string(),
  image: z.string().startsWith("data:image/"),
});

export function CreateSliceFromImageModal(
  props: CreateSliceFromImageModalProps,
) {
  const { open, location, onSuccess, onClose } = props;
  const router = useRouter();

  const [slices, setSlices] = useState<Slice[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const { syncChanges } = useAutoSync();
  const { createSliceSuccess } = useSliceMachineActions();
  const { completeStep } = useOnboarding();
  const existingSlices = useExistingSlices({ open });
  const isFigmaEnabled = useIsFigmaEnabled();
  const { libraryID, isLoading: isLoadingLibraryID } = useLibraryID();
  const stableCancelGeneratingRequests = useStableCallback(
    cancelGeneratingRequests,
  );

  /**
   * Keeps track of the current instance id.
   * When the modal is closed, the id is reset.
   */
  const id = useRef(crypto.randomUUID());

  useHotkeys(
    ["meta+v", "ctrl+v"],
    (event) => {
      event.preventDefault();
      void onPaste({ isShortcut: true });
    },
    { enabled: open && isFigmaEnabled },
  );

  useEffect(() => {
    if (!slices.some((slice) => slice.status === "generating")) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      stableCancelGeneratingRequests();
      const message = "Your current generating slices will be cancelled.";
      event.returnValue = message;
      return message;
    };

    router.events.on("routeChangeStart", stableCancelGeneratingRequests);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      router.events.off("routeChangeStart", stableCancelGeneratingRequests);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [slices, router.events, stableCancelGeneratingRequests]);

  const setSlice = (args: {
    index: number;
    slice: (prevSlice: Slice) => Slice;
  }) => {
    const { index, slice } = args;
    setSlices((slices) => slices.map((s, i) => (i === index ? slice(s) : s)));
  };

  const onImagesSelected = (images: File[]) => {
    if (hasTriggeredGeneration) return;

    if (images.length > IMAGE_UPLOAD_LIMIT) {
      toast.error(
        `You can only upload ${IMAGE_UPLOAD_LIMIT} images at a time.`,
      );
      return;
    }

    const startIndex = slices.length;
    setSlices((prevSlices) => [
      ...prevSlices,
      ...images.map(
        (image): Slice => ({
          source: "upload",
          status: "uploading",
          image,
        }),
      ),
    ]);

    images.forEach((image, relativeIndex) => {
      const index = startIndex + relativeIndex;
      void uploadImage({ index, image, source: "upload" });
    });
  };

  const uploadImage = async (args: {
    index: number;
    image: File;
    source: "figma" | "upload";
  }) => {
    const { index, image, source } = args;
    const currentId = id.current;

    setSlice({
      index,
      slice: (prevSlice) => ({
        ...prevSlice,
        status: "uploading",
        image,
        source,
      }),
    });

    try {
      const imageUrl = await getImageUrl({ image });
      if (currentId !== id.current) return;

      setSlice({
        index,
        slice: (prevSlice) => ({
          ...prevSlice,
          status: "pending",
          thumbnailUrl: imageUrl,
        }),
      });
    } catch {
      if (currentId !== id.current) return;
      setSlice({
        index,
        slice: (prevSlice) => ({
          ...prevSlice,
          status: "uploadError",
          onRetry: () => void uploadImage({ index, image, source }),
        }),
      });
    }
  };

  const inferSlice = async (args: {
    index: number;
    imageUrl: string;
    source: "figma" | "upload";
  }) => {
    if (libraryID === undefined) return;

    const { index, imageUrl, source } = args;
    let currentId = id.current;

    const requestId = crypto.randomUUID();

    setSlice({
      index,
      slice: (prevSlice) => ({
        ...prevSlice,
        status: "generating",
        thumbnailUrl: imageUrl,
        requestId,
      }),
    });

    try {
      void telemetry.track({ event: "slice-generation:started", source });

      const inferResult = await managerClient.customTypes.inferSlice({
        source,
        libraryID,
        imageUrl,
        requestId,
      });

      if (currentId !== id.current) return;

      const model = sliceWithoutConflicts({
        existingSlices: existingSlices.current,
        newSlices: slices,
        slice: inferResult.slice,
      });

      setSlices((prevSlices) => {
        return prevSlices.map((prevSlice, i) => {
          if (i !== index) return prevSlice;
          return {
            ...prevSlice,
            status: "success",
            thumbnailUrl: imageUrl,
            model,
            langSmithUrl: inferResult.langSmithUrl,
          };
        });
      });

      if (source === "upload") {
        currentId = id.current;
        const currentSlice = slices[index];

        const { errors } = await managerClient.slices.createSlice({
          libraryID,
          model: model,
        });
        if (errors.length) {
          throw new Error(`Failed to create slice ${model.id}.`);
        }

        await managerClient.slices.updateSliceScreenshot({
          libraryID,
          sliceID: model.id,
          variationID: model.variations[0].id,
          data: currentSlice.image,
        });

        if (currentId !== id.current) return;
      }

      void completeStep("createSlice");

      void telemetry.track({
        event: "slice:created",
        id: model.id,
        name: model.name,
        library: libraryID,
        location,
        ...(source === "figma"
          ? { mode: "figma-to-slice" }
          : { mode: "ai", langSmithUrl: inferResult.langSmithUrl }),
      });

      void telemetry.track({ event: "slice-generation:ended", error: false });

      addAiFeedback({
        type: "model",
        library: libraryID,
        sliceId: model.id,
        variationId: model.variations[0].id,
        langSmithUrl: inferResult.langSmithUrl,
      });
    } catch (error) {
      if (currentId !== id.current) return;

      setSlice({
        index,
        slice: (prevSlice) => ({
          ...prevSlice,
          status:
            error instanceof Error && error.name === "AbortError"
              ? "cancelled"
              : "generateError",
          thumbnailUrl: imageUrl,
          onRetry: () => {
            void inferSlice({ index, imageUrl, source });
          },
        }),
      });

      void telemetry.track({ event: "slice-generation:ended", error: true });
    }
  };

  const generatePendingSlices = () => {
    if (libraryID === undefined) return;

    slices.forEach((slice, index) => {
      if (slice.status === "pending") {
        void inferSlice({
          index,
          imageUrl: slice.thumbnailUrl,
          source: slice.source,
        });
      }
    });
  };

  const totals = slices.reduce(
    (result, slice) => {
      if (slice.status === "generating") {
        result.generating++;
      } else if (slice.status === "uploading") {
        result.uploading++;
      } else if (slice.status === "pending") {
        result.pending++;
      } else if (slice.status === "success") {
        result.completed++;
      }
      result.loading = result.generating + result.uploading;

      /** Total count for the generate button.
       * Avoids resetting to zero when switching status for better UX. */
      result.generate = result.loading + result.pending;

      return result;
    },
    {
      generating: 0,
      uploading: 0,
      pending: 0,
      completed: 0,
      loading: 0,
      generate: 0,
    },
  );

  const hasTriggeredGeneration = totals.generating > 0 || totals.completed > 0;

  const closeModal = () => {
    if (totals.loading > 0) return;
    onClose();
    id.current = crypto.randomUUID();
    setTimeout(() => setSlices([]), 250); // wait for the modal fade animation
  };

  const onSubmit = async () => {
    if (libraryID === undefined) return;

    try {
      setIsSubmitting(true);

      const serverState = await getState();
      createSliceSuccess(serverState.libraries);
      syncChanges();

      onSuccess({
        slices: slices.flatMap((slice) =>
          slice.status === "success" ? slice.model : [],
        ),
        library: libraryID,
      });

      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPaste = async (args?: { isShortcut?: boolean }) => {
    const { isShortcut = false } = args ?? {};

    if (
      !open ||
      !isFigmaEnabled ||
      // For now we only support one Figma slice at a time
      slices.some((slice) => slice.source === "figma")
    ) {
      return;
    }

    // Don't allow pasting while uploads or generation are in progress
    const isLoading = slices.some(
      (slice) => slice.status === "uploading" || slice.status === "generating",
    );
    if (isLoading) return;

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
      const image = new File([imageBlob], imageName, {
        type: imageBlob.type,
      });
      const newIndex = currentSliceCount;

      // Append new slice to existing ones
      setSlices((prevSlices) => [
        ...prevSlices,
        {
          source: "figma",
          status: "uploading",
          image,
        },
      ]);

      // Start uploading the new image
      void uploadImage({ index: newIndex, image, source: "figma" });

      void telemetry.track({
        event: "slice-generation:pasted-from-figma",
        source: isShortcut ? "shortcut" : "button",
      });

      toast.success(`Pasted ${imageName}${success ? " from Figma" : ""}`);
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
      toast.error(
        "Failed to paste from clipboard. Please check browser permissions and try again.",
      );
    }
  };

  function cancelGeneratingRequests() {
    const cancelableIds = slices.flatMap((slice) => {
      return slice.status === "generating" ? [slice.requestId] : [];
    });
    if (cancelableIds.length === 0) return;

    cancelableIds.forEach((requestId) => {
      void managerClient.customTypes.cancelInferSlice({ requestId });
    });
  }

  const onCancelConfirm = () => {
    setShowCancelConfirmation(false);
    cancelGeneratingRequests();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && closeModal()}>
      <DialogHeader title="Generate slices with AI" />
      <DialogContent gap={0}>
        <DialogDescription hidden>
          Upload images to generate slices with AI
        </DialogDescription>
        {!isLoadingLibraryID ? (
          <>
            {slices.length === 0 ? (
              <Box
                padding={16}
                height="100%"
                gap={16}
                display="flex"
                flexDirection="column"
              >
                {isFigmaEnabled && (
                  <Box
                    display="flex"
                    gap={16}
                    alignItems="center"
                    backgroundColor="grey2"
                    padding={16}
                    borderRadius={12}
                  >
                    <Box
                      display="flex"
                      gap={8}
                      alignItems="center"
                      flexGrow={1}
                    >
                      <Box
                        width={48}
                        height={48}
                        backgroundColor="grey12"
                        borderRadius="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FigmaIcon height={25} />
                      </Box>
                      <Box display="flex" flexDirection="column" flexGrow={1}>
                        <Text variant="bold">Want to work faster?</Text>
                        <Text variant="small" color="grey11">
                          Copy frames from Figma with the Slice Machine plugin
                          and paste them here.
                        </Text>
                      </Box>
                    </Box>
                    <Button
                      endIcon="arrowForward"
                      color="indigo"
                      onClick={() => {
                        window.open(
                          "https://www.figma.com/community/plugin/1567955296461153730/figma-to-slice",
                          "_blank",
                        );
                        void telemetry.track({
                          event: "slice-generation:plugin-installation-clicked",
                        });
                      }}
                      sx={{ marginRight: 8 }}
                      invisible
                    >
                      Install plugin
                    </Button>
                  </Box>
                )}
                <FileDropZone
                  onFilesSelected={onImagesSelected}
                  assetType="image"
                  maxFiles={IMAGE_UPLOAD_LIMIT}
                  overlay={
                    <UploadBlankSlate
                      onFilesSelected={onImagesSelected}
                      onPaste={onPaste}
                      droppingFiles
                    />
                  }
                >
                  <UploadBlankSlate
                    onFilesSelected={onImagesSelected}
                    onPaste={onPaste}
                  />
                </FileDropZone>
              </Box>
            ) : (
              <>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  padding={16}
                >
                  <Text variant="h3">Design</Text>
                  <FileUploadButton
                    size="medium"
                    color="grey"
                    onFilesSelected={onImagesSelected}
                    startIcon="attachFile"
                    disabled={hasTriggeredGeneration}
                  >
                    Add images
                  </FileUploadButton>
                </Box>
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
              </>
            )}
            <DialogActions>
              {totals.generating > 0 ? (
                <DialogCancelButton
                  onClick={() => setShowCancelConfirmation(true)}
                  size="medium"
                  sx={{ marginRight: 8 }}
                  invisible
                >
                  Cancel
                </DialogCancelButton>
              ) : (
                <DialogCancelButton
                  onClick={() => closeModal()}
                  size="medium"
                  sx={{ marginRight: 8 }}
                  invisible
                >
                  Close
                </DialogCancelButton>
              )}
              {totals.completed === 0 || totals.loading > 0 ? (
                <DialogActionButton
                  color="purple"
                  startIcon="autoFixHigh"
                  onClick={generatePendingSlices}
                  disabled={
                    hasTriggeredGeneration ||
                    totals.loading > 0 ||
                    totals.pending === 0
                  }
                  loading={totals.loading > 0}
                  size="medium"
                >
                  Generate {totals.generate > 0 ? `(${totals.generate}) ` : ""}
                  {totals.generate === 1 ? "Slice" : "Slices"}
                </DialogActionButton>
              ) : (
                <DialogActionButton
                  color="purple"
                  onClick={() => void onSubmit()}
                  loading={isSubmitting}
                  size="medium"
                >
                  {getSubmitButtonLabel(location, totals.completed)}
                </DialogActionButton>
              )}
            </DialogActions>
          </>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <ProgressCircle color="purple9" />
          </Box>
        )}
      </DialogContent>
      <Dialog
        size="small"
        open={showCancelConfirmation}
        onOpenChange={setShowCancelConfirmation}
      >
        <DialogHeader title="Cancel generation" />
        <DialogContent>
          <DialogDescription>
            <Box display="flex" flexDirection="column" padding={{ inline: 16 }}>
              <Text variant="bold">
                Are you sure you want to cancel the generation for all slices?
              </Text>
            </Box>
          </DialogDescription>
          <DialogActions>
            <DialogCancelButton
              onClick={() => setShowCancelConfirmation(false)}
              size="small"
            >
              Keep generating
            </DialogCancelButton>
            <DialogActionButton
              color="tomato"
              onClick={onCancelConfirm}
              size="small"
            >
              Confirm
            </DialogActionButton>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function UploadBlankSlate(props: {
  droppingFiles?: boolean;
  onFilesSelected: (files: File[]) => void;
  onPaste: () => void | Promise<void>;
}) {
  const { droppingFiles = false, onFilesSelected, onPaste } = props;
  const isFigmaEnabled = useIsFigmaEnabled();

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
            {isFigmaEnabled ? (
              <>
                <Text>Generate slices from your designs</Text>
                <Text variant="small" color="grey11">
                  Upload your design images or paste them directly from Figma.
                </Text>
              </>
            ) : (
              <>
                <Text>Upload your design images.</Text>
                <Text variant="small" color="grey11">
                  Once uploaded, you can generate slices automatically using AI.
                </Text>
              </>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={16}>
            {isFigmaEnabled ? (
              <>
                <Button
                  size="small"
                  renderStartIcon={() => <FigmaIcon height={16} />}
                  color="grey"
                  onClick={() => void onPaste()}
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
              </>
            ) : (
              <FileUploadButton
                startIcon="attachFile"
                onFilesSelected={onFilesSelected}
                color="grey"
              >
                Add images
              </FileUploadButton>
            )}
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

const getSubmitButtonLabel = (
  location: "custom_type" | "page_type" | "slices",
  completedSliceCount: number,
) => {
  switch (location) {
    case "custom_type":
      return `Add to type (${completedSliceCount})`;
    case "page_type":
      return `Add to page (${completedSliceCount})`;
    case "slices":
      return "Done";
  }
};

function useIsFigmaEnabled() {
  const experiment = useExperimentVariant("llm-proxy-access");
  return experiment?.value === "on";
}

function useLibraryID() {
  const [libraryID, setLibraryID] = useState<string | undefined>();

  useEffect(() => {
    managerClient.project
      .getSliceMachineConfig()
      .then((smConfig) => {
        const libraryID = smConfig?.libraries?.[0];
        if (libraryID === undefined) {
          throw new Error("No library found in the config.");
        }
        setLibraryID(libraryID);
      })
      .catch(() => {
        throw new Error("Could not get library ID from the config.");
      });
  }, []);

  return { libraryID, isLoading: libraryID === undefined };
}
