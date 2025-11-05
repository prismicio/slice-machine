import {
  Box,
  Button,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  ScrollArea,
  Text,
  TextInput,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { getState, telemetry } from "@/apiClient";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { getSubmitButtonLabel } from "../shared/getSubmitButtonLabel";
import { useExistingSlices } from "../shared/useExistingSlices";
import { useImportSlicesFromGithub } from "./hooks/useImportSlicesFromGithub";
import { SliceCard } from "./SliceCard";
import { NewSlice } from "./types";
import { addSlices } from "./utils/addSlices";
import { sliceWithoutConflicts } from "./utils/sliceWithoutConflicts";

interface ImportSlicesFromLibraryModalProps {
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

export function ImportSlicesFromLibraryModal(
  props: ImportSlicesFromLibraryModalProps,
) {
  const { open, location, onSuccess, onClose } = props;

  const [isCreatingSlices, setIsCreatingSlices] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedSliceIds, setSelectedSliceIds] = useState<Set<string>>(
    new Set(),
  );

  const { syncChanges } = useAutoSync();
  const { createSliceSuccess, updateSliceMockSuccess } =
    useSliceMachineActions();
  const { completeStep } = useOnboarding();
  const existingSlices = useExistingSlices({ open });
  const { isLoadingSlices, handleImportFromGithub, slices, resetSlices } =
    useImportSlicesFromGithub();

  useEffect(() => {
    if (slices.length === 0) return;

    // Set all slices as selected by default
    const allSliceIds = new Set<string>();
    for (const slice of slices) {
      allSliceIds.add(slice.model.id);
    }
    setSelectedSliceIds(allSliceIds);
  }, [slices]);

  /**
   * Keeps track of the current instance id.
   * When the modal is closed, the id is reset.
   */
  const id = useRef(crypto.randomUUID());

  const onOpenChange = (open: boolean) => {
    if (open || isCreatingSlices) return;
    onClose();
    id.current = crypto.randomUUID();
    setGithubUrl("");
    setSelectedSliceIds(new Set());
    resetSlices();
  };

  const onSubmit = () => {
    const newSlices = slices.reduce<NewSlice[]>((acc, slice) => {
      if (selectedSliceIds.has(slice.model.id)) {
        acc.push({
          image: slice.image,
          model: slice.model,
          files: slice.files,
          componentContents: slice.componentContents,
          mocks: slice.mocks,
          screenshots: slice.screenshots,
        });
      }
      return acc;
    }, []);
    if (!newSlices.length) {
      toast.error("Please select at least one slice to import");
      return;
    }

    // Ensure ids and names are conflict-free against existing and newly-added slices
    const conflictFreeSlices: NewSlice[] = [];
    for (const s of newSlices) {
      const adjustedModel = sliceWithoutConflicts({
        existingSlices: existingSlices.current,
        newSlices: conflictFreeSlices,
        slice: s.model,
      });
      conflictFreeSlices.push({ ...s, model: adjustedModel });
    }

    const currentId = id.current;
    setIsCreatingSlices(true);
    addSlices(conflictFreeSlices)
      .then(async ({ slices, library }) => {
        if (currentId !== id.current) return;

        // Wait a moment to ensure all file writes are complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        const serverState = await getState();

        // Ensure mocks are included in the libraries data before updating store
        const librariesWithMocks = serverState.libraries.map((lib) => {
          if (lib.name !== library) return lib;

          return {
            ...lib,
            components: lib.components.map((component) => {
              // Find the corresponding slice from newSlices to get its mocks
              const importedSlice = conflictFreeSlices.find(
                (s) => s.model.id === component.model.id,
              );

              // If mocks are already in component, use them; otherwise use imported mocks
              const mocks =
                component.mocks && component.mocks.length > 0
                  ? component.mocks
                  : importedSlice?.mocks;

              return {
                ...component,
                mocks: mocks ?? component.mocks,
              };
            }),
          };
        });

        createSliceSuccess(librariesWithMocks);

        // Also update mocks individually to ensure they're in the store
        for (const slice of newSlices) {
          if (
            slice.mocks &&
            Array.isArray(slice.mocks) &&
            slice.mocks.length > 0
          ) {
            updateSliceMockSuccess({
              libraryID: library,
              sliceID: slice.model.id,
              mocks: slice.mocks,
            });
          }
        }

        syncChanges();

        onSuccess({ slices, library });

        setIsCreatingSlices(false);
        id.current = crypto.randomUUID();
        resetSlices();

        void completeStep("createSlice");

        for (const { model } of slices) {
          void telemetry.track({
            event: "slice:created",
            id: model.id,
            name: model.name,
            library,
            location,
            mode: "import",
          });
        }
      })
      .catch(() => {
        if (currentId !== id.current) return;
        setIsCreatingSlices(false);
        toast.error("An unexpected error happened while adding slices.");
      });
  };

  const selectedSlices = slices.filter((slice) =>
    selectedSliceIds.has(slice.model.id),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader title="Import slices from library" />
      <DialogContent gap={0}>
        <DialogDescription hidden>
          Import slices from a github repository
        </DialogDescription>
        {slices.length === 0 ? (
          <Box padding={16} height="100%" flexDirection="column" gap={16}>
            <Box flexDirection="column" gap={8}>
              <Box
                display="flex"
                flexDirection="column"
                gap={8}
                padding={16}
                border
                borderRadius={8}
              >
                <Text color="grey11">Import from GitHub</Text>
                <TextInput
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onValueChange={setGithubUrl}
                />
                <Button
                  onClick={() => handleImportFromGithub(githubUrl)}
                  disabled={!githubUrl.trim() || isLoadingSlices}
                  loading={isLoadingSlices}
                  color="purple"
                >
                  {isLoadingSlices ? "Loading slices..." : "Import from GitHub"}
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          <ScrollArea stableScrollbar={false}>
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr 1fr"
              gap={16}
              padding={16}
            >
              {slices.map((slice) => {
                return (
                  <SliceCard
                    model={slice.model}
                    thumbnailUrl={slice.thumbnailUrl}
                    key={slice.model.id}
                    selected={selectedSliceIds.has(slice.model.id)}
                    onSelectedChange={(selected) => {
                      if (selected) {
                        setSelectedSliceIds((prev) => {
                          const next = new Set(prev);
                          next.add(slice.model.id);
                          return next;
                        });
                      } else {
                        setSelectedSliceIds((prev) => {
                          const next = new Set(prev);
                          next.delete(slice.model.id);
                          return next;
                        });
                      }
                    }}
                  />
                );
              })}
            </Box>
          </ScrollArea>
        )}

        <DialogActions>
          <DialogCancelButton disabled={isCreatingSlices} />
          <DialogActionButton
            disabled={selectedSlices.length === 0}
            loading={isCreatingSlices}
            onClick={onSubmit}
          >
            {getSubmitButtonLabel(location)} ({selectedSlices.length})
          </DialogActionButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
