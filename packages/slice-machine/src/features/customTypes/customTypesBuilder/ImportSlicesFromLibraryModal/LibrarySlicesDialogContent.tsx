import { useStableEffect } from "@prismicio/editor-support/React";
import {
  Box,
  Button,
  Checkbox,
  InlineLabel,
  ScrollArea,
  Text,
  TextInput,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

import { getState, telemetry } from "@/apiClient";
import { useExistingSlices } from "@/features/customTypes/customTypesBuilder/shared/useExistingSlices";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { DialogButtons } from "./DialogButtons";
import { DialogContent } from "./DialogContent";
import { DialogTabs } from "./DialogTabs";
import { useImportSlicesFromGithub } from "./hooks/useImportSlicesFromGithub";
import { SliceCard } from "./SliceCard";
import { NewSlice, SliceImport } from "./types";
import { addSlices } from "./utils/addSlices";
import { sliceWithoutConflicts } from "./utils/sliceWithoutConflicts";

export function ReuseSlicesDialogContent() {}

interface LibrarySlicesDialogContentProps {
  open: boolean;
  location: "custom_type" | "page_type";
  typeName: string;
  onSuccess: (args: { slices: SharedSlice[]; library?: string }) => void;
  onClose: () => void;
  onSelectTab: (tab: "local" | "library") => void;
  selected: boolean;
}

export function LibrarySlicesDialogContent(
  props: LibrarySlicesDialogContentProps,
) {
  const { open, location, typeName, onSelectTab, selected } = props;

  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlices, setSelectedSlices] = useState<SliceImport[]>([]);

  const {
    isLoadingSlices,
    handleImportFromGithub,
    slices: importedSlices,
    resetSlices,
  } = useImportSlicesFromGithub();

  const smActions = useSliceMachineActions();

  const existingSlicesRef = useExistingSlices({ open });
  const { syncChanges } = useAutoSync();
  const { completeStep } = useOnboarding();

  /**
   * Keeps track of the current instance id.
   * When the modal is closed, the id is reset.
   */
  const id = useRef(crypto.randomUUID());

  useStableEffect(() => {
    if (!open) {
      setSelectedSlices([]);
      resetSlices();
      setGithubUrl("");
      id.current = crypto.randomUUID();
    }
  }, [open]);

  const onSelectAll = (checked: boolean) => {
    setSelectedSlices(checked ? importedSlices : []);
  };

  const onImport = () => {
    void handleImportFromGithub(githubUrl);
  };

  const onSelect = (slice: SliceImport) => {
    setSelectedSlices((prev) => {
      const isSelected = prev.some((s) => s.model.id === slice.model.id);
      if (isSelected) {
        return prev.filter((s) => s.model.id !== slice.model.id);
      }
      return [...prev, slice];
    });
  };

  const onSubmit = async () => {
    if (selectedSlices.length === 0) {
      return toast.error("Please select at least one slice");
    }

    // Prepare library slices for import
    const librarySlicesToImport: NewSlice[] = selectedSlices.map((slice) => ({
      image: slice.image,
      model: slice.model,
      files: slice.files,
      componentContents: slice.componentContents,
      mocks: slice.mocks,
      screenshots: slice.screenshots,
    }));

    // Ensure ids and names are conflict-free against existing and newly-added slices
    const conflictFreeSlices: NewSlice[] = [];

    for (const s of librarySlicesToImport) {
      const adjustedModel = sliceWithoutConflicts({
        existingSlices: existingSlicesRef.current,
        newSlices: conflictFreeSlices,
        slice: s.model,
      });
      conflictFreeSlices.push({ ...s, model: adjustedModel });
    }

    const currentId = id.current;
    setIsSubmitting(true);

    try {
      const { slices: createdSlices, library } =
        await addSlices(conflictFreeSlices);

      if (currentId !== id.current) {
        throw new Error("Modal instance changed");
      }

      // Wait a moment to ensure all file writes are complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const serverState = await getState();

      // Ensure mocks are included in the libraries data before updating store
      const librariesWithMocks = serverState.libraries.map((lib) => {
        if (lib.name !== library) return lib;

        return {
          ...lib,
          components: lib.components.map((component) => {
            // Find the corresponding slice from librarySlicesToImport to get its mocks
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

      smActions.createSliceSuccess(librariesWithMocks);

      // Also update mocks individually to ensure they're in the store
      for (const slice of librarySlicesToImport) {
        if (
          slice.mocks &&
          Array.isArray(slice.mocks) &&
          slice.mocks.length > 0
        ) {
          smActions.updateSliceMockSuccess({
            libraryID: library,
            sliceID: slice.model.id,
            mocks: slice.mocks,
          });
        }
      }

      syncChanges();

      // Combine local slices with created library slices
      const allSlices: SharedSlice[] = [
        ...existingSlicesRef.current,
        ...createdSlices.map((s) => s.model),
      ] as SharedSlice[];

      setIsSubmitting(false);
      resetSlices();

      void completeStep("createSlice");

      for (const { model } of createdSlices) {
        void telemetry.track({
          event: "slice:created",
          id: model.id,
          name: model.name,
          library,
          location,
          mode: "import",
        });
      }

      return { slices: allSlices, library };
    } catch (error) {
      if (currentId !== id.current) {
        throw error;
      }
      setIsSubmitting(false);
      toast.error("An unexpected error happened while adding slices.");
      throw error;
    }
  };

  const allSelected = importedSlices.every((slice) =>
    selectedSlices.some((s) => s.model.id === slice.model.id),
  );
  const someSelected = importedSlices.some((slice) =>
    selectedSlices.some((s) => s.model.id === slice.model.id),
  );

  let selectAllLabel = "Select all slices";
  if (allSelected) {
    selectAllLabel = `Selected all slices (${selectedSlices.length})`;
  } else if (someSelected) {
    selectAllLabel = `${selectedSlices.length} of ${importedSlices.length} selected`;
  }

  return (
    <DialogContent selected={selected}>
      <DialogTabs
        selectedTab="library"
        onSelectTab={onSelectTab}
        rightContent={"<repo-select>"}
      />

      <Box display="flex" flexDirection="column" flexGrow={1} minHeight={0}>
        {importedSlices.length > 0 ? (
          <Box flexDirection="column" flexGrow={1} minHeight={0}>
            <Box
              padding={{ block: 12, inline: 16 }}
              alignItems="center"
              gap={8}
            >
              <InlineLabel value={selectAllLabel}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onCheckedChange={onSelectAll}
                />
              </InlineLabel>
            </Box>
            <ScrollArea stableScrollbar={false}>
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr 1fr"
                gap={16}
                padding={{ inline: 16, bottom: 16 }}
              >
                {importedSlices.map((slice) => {
                  const isSelected = selectedSlices.some(
                    (s) => s.model.id === slice.model.id,
                  );
                  return (
                    <SliceCard
                      model={slice.model}
                      thumbnailUrl={slice.thumbnailUrl}
                      key={slice.model.id}
                      selected={isSelected}
                      onSelectedChange={() => onSelect(slice)}
                    />
                  );
                })}
              </Box>
            </ScrollArea>
          </Box>
        ) : (
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
                  onClick={() => void onImport()}
                  disabled={!githubUrl.trim() || isLoadingSlices}
                  loading={isLoadingSlices}
                  color="purple"
                >
                  {isLoadingSlices ? "Loading slices..." : "Import from GitHub"}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <DialogButtons
        totalSelected={selectedSlices.length}
        onSubmit={() => void onSubmit()}
        isSubmitting={isSubmitting}
        location={location}
        typeName={typeName}
      />
    </DialogContent>
  );
}
