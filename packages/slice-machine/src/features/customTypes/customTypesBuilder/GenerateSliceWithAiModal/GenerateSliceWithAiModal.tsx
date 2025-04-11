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
import { useRef, useState } from "react";
import { toast } from "react-toastify";

import { managerClient } from "@/managerClient";

import { Slice, SliceCard } from "./SliceCard";

const IMAGE_UPLOAD_LIMIT = 10;

interface GenerateSliceWithAiModalProps {
  open: boolean;
  onSuccess: (args: {
    slices: {
      model: SharedSlice;
      langSmithUrl?: string;
    }[];
    library: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function GenerateSliceWithAiModal(props: GenerateSliceWithAiModalProps) {
  const { open, onSuccess, onClose } = props;
  const [slices, setSlices] = useState<Slice[]>([]);
  const [isCreatingSlices, setIsCreatingSlices] = useState(false);

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
    id.current = crypto.randomUUID();
    onClose();
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
        setSlice({
          index,
          slice: (prevSlice) => ({
            ...prevSlice,
            status: "success",
            thumbnailUrl: imageUrl,
            model: slice,
            langSmithUrl,
          }),
        });
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
        id.current = crypto.randomUUID();
        await onSuccess({ slices, library });
        setIsCreatingSlices(false);
        setSlices([]);
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

async function addSlices(newSlices: NewSlice[]) {
  // use the first library
  const { libraries = [] } =
    await managerClient.project.getSliceMachineConfig();
  const library = libraries[0];
  if (!library) {
    throw new Error("No library found in the config.");
  }

  // add the slices computing new ids/names if needed
  const models = await managerClient.slices.addSlices({
    library,
    models: newSlices.map((slice) => slice.model),
  });

  // for each added slice, set the variation screenshot
  const slices = await Promise.all(
    models.map(async (model, index) => {
      await managerClient.slices.updateSliceScreenshot({
        libraryID: library,
        sliceID: model.id,
        variationID: model.variations[0].id,
        data: newSlices[index].image,
      });
      return {
        model,
        langSmithUrl: newSlices[index].langSmithUrl,
      };
    }),
  );

  return { library, slices };
}
