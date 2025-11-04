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
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "react-toastify";

import { getState, telemetry } from "@/apiClient";
import { addAiFeedback } from "@/features/aiFeedback";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { managerClient } from "@/managerClient";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { Slice, SliceCard } from "./SliceCard";

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
  const { open, location, onSuccess, onClose } = props;
  const [slices, setSlices] = useState<Slice[]>([]);
  const [isCreatingSlices, setIsCreatingSlices] = useState(false);
  const { syncChanges } = useAutoSync();
  const { createSliceSuccess } = useSliceMachineActions();
  const { completeStep } = useOnboarding();

  /**
   * Keeps track of the current instance id.
   * When the modal is closed, the id is reset.
   */
  const id = useRef(crypto.randomUUID());

  const setSlice = (args: {
    index: number;
    slice: (prevSlice: Slice) => Slice;
  }) => {
    const { index, slice } = args;
    setSlices((slices) => slices.map((s, i) => (i === index ? slice(s) : s)));
  };

  const onOpenChange = (open: boolean) => {
    if (open || isCreatingSlices) return;
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
        image,
      })),
    );

    images.forEach((image, index) => uploadImage({ index, image }));
  };

  // Clipboard paste handler
  const handlePaste = async () => {
    const supportsClipboardRead =
      typeof navigator.clipboard?.read === "function";

    if (!supportsClipboardRead) {
      toast.error("Clipboard paste is not supported in this browser.");
      return;
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      if (clipboardItems.length === 0) return;

      let imageName = "pasted-image.png";
      let imageBlob: Blob | null = null;

      // Try to read JSON text from clipboard to get frame name
      for (const item of clipboardItems) {
        console.log("item", item);
        if (item.types.includes("text/plain")) {
          try {
            const textBlob = await item.getType("text/plain");
            const text = await textBlob.text();
            const data = JSON.parse(text) as unknown;
            if (
              data !== null &&
              typeof data === "object" &&
              "name" in data &&
              typeof data.name === "string"
            ) {
              imageName = `${data.name}.png`;
            }
          } catch {
            // Ignore JSON parsing errors
          }
        }
      }

      // Find and extract image from clipboard
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType !== undefined) {
          imageBlob = await item.getType(imageType);
          break;
        }
      }

      if (!imageBlob) {
        toast.error("No image found in clipboard.");
        return;
      }

      // Create File object from blob
      const file = new File([imageBlob], imageName, { type: imageBlob.type });
      onImagesSelected([file]);

      toast.success(`Pasted ${imageName}`);
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
      toast.error("Failed to paste from clipboard. Please try again.");
    }
  };

  // Enable paste with Cmd+V / Ctrl+V when modal is open
  useHotkeys(
    ["meta+v", "ctrl+v"],
    (event) => {
      event.preventDefault();
      void handlePaste();
    },
    { enabled: open },
  );

  const uploadImage = (args: { index: number; image: File }) => {
    const { index, image } = args;
    const currentId = id.current;

    setSlice({
      index,
      slice: (prevSlice) => ({
        ...prevSlice,
        status: "uploading",
      }),
    });

    getImageUrl({ image }).then(
      (imageUrl) => {
        if (currentId !== id.current) return;
        inferSlice({ index, imageUrl });
      },
      () => {
        if (currentId !== id.current) return;
        setSlice({
          index,
          slice: (prevSlice) => ({
            ...prevSlice,
            status: "uploadError",
            onRetry: () => uploadImage({ index, image }),
          }),
        });
      },
    );
  };

  const existingSlices = useExistingSlices({ open });

  const inferSlice = (args: { index: number; imageUrl: string }) => {
    const { index, imageUrl } = args;
    const currentId = id.current;

    setSlice({
      index,
      slice: (prevSlice) => ({
        ...prevSlice,
        status: "generating",
        thumbnailUrl: imageUrl,
      }),
    });

    managerClient.customTypes.inferSlice({ imageUrl }).then(
      ({ slice, langSmithUrl }) => {
        if (currentId !== id.current) return;

        setSlices((prevSlices) =>
          prevSlices.map((prevSlice, i) =>
            i === index
              ? {
                  ...prevSlice,
                  status: "success",
                  thumbnailUrl: imageUrl,
                  model: sliceWithoutConflicts({
                    existingSlices: existingSlices.current,
                    newSlices: prevSlices,
                    slice,
                  }),
                  langSmithUrl,
                }
              : prevSlice,
          ),
        );
      },
      () => {
        if (currentId !== id.current) return;
        setSlice({
          index,
          slice: (prevSlice) => ({
            ...prevSlice,
            status: "generateError",
            thumbnailUrl: imageUrl,
            onRetry: () => inferSlice({ index, imageUrl }),
          }),
        });
      },
    );
  };

  const onSubmit = () => {
    const newSlices = slices.reduce<NewSlice[]>((acc, slice) => {
      if (slice.status === "success") acc.push(slice);
      return acc;
    }, []);
    if (!newSlices.length) return;

    const currentId = id.current;
    setIsCreatingSlices(true);
    addSlices(newSlices)
      .then(async ({ slices, library }) => {
        if (currentId !== id.current) return;

        const serverState = await getState();
        createSliceSuccess(serverState.libraries);
        syncChanges();

        onSuccess({ slices, library });

        setIsCreatingSlices(false);
        id.current = crypto.randomUUID();
        setSlices([]);

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
      })
      .catch(() => {
        if (currentId !== id.current) return;
        setIsCreatingSlices(false);
        toast.error("An unexpected error happened while adding slices.");
      });
  };

  const areSlicesLoading = slices.some(
    (slice) => slice.status === "uploading" || slice.status === "generating",
  );
  const readySlices = slices.filter((slice) => slice.status === "success");
  const someSlicesReady = readySlices.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader title="Generate from image" />
      <DialogContent gap={0}>
        <DialogDescription hidden>
          Upload images to generate slices with AI
        </DialogDescription>
        {slices.length === 0 ? (
          <Box padding={16} height="100%">
            <FileDropZone
              onFilesSelected={onImagesSelected}
              assetType="image"
              maxFiles={IMAGE_UPLOAD_LIMIT}
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
          <DialogCancelButton disabled={isCreatingSlices} />
          <DialogActionButton
            disabled={!someSlicesReady || areSlicesLoading}
            loading={isCreatingSlices}
            onClick={onSubmit}
          >
            {getSubmitButtonLabel(location)} ({readySlices.length})
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

const getSubmitButtonLabel = (
  location: "custom_type" | "page_type" | "slices",
) => {
  switch (location) {
    case "custom_type":
      return "Add to type";
    case "page_type":
      return "Add to page";
    case "slices":
      return "Add to slices";
  }
};
