import {
  Box,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  Tab,
  Text,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

import { getState, telemetry } from "@/apiClient";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { getSubmitButtonLabel } from "../shared/getSubmitButtonLabel";
import { useExistingSlices } from "../shared/useExistingSlices";
import { useImportSlicesFromGithub } from "./hooks/useImportSlicesFromGithub";
import { ImportSlicesProvider, useImportSlicesContext } from "./ImportSlicesContext";
import { LibrarySlicesTab } from "./LibrarySlicesTab";
import { LocalSlicesTab } from "./LocalSlicesTab";
import { NewSlice } from "./types";
import { addSlices } from "./utils/addSlices";
import { sliceWithoutConflicts } from "./utils/sliceWithoutConflicts";

interface ImportSlicesFromLibraryModalProps {
  open: boolean;
  location: "custom_type" | "page_type" | "slices";
  availableSlices?: ReadonlyArray<ComponentUI>;
  onSuccess: (args: {
    slices: SharedSlice[];
    library?: string;
  }) => void;
  onClose: () => void;
}

function ImportSlicesFromLibraryModalContent(
  props: ImportSlicesFromLibraryModalProps,
) {
  const { open, location, availableSlices = [], onSuccess, onClose } = props;
  const [isCreatingSlices, setIsCreatingSlices] = useState(false);
  const [selectedTab, setSelectedTab] = useState("local");

  const { syncChanges } = useAutoSync();
  const { createSliceSuccess, updateSliceMockSuccess } =
    useSliceMachineActions();
  const { completeStep } = useOnboarding();
  const existingSlices = useExistingSlices({ open });
  const { resetSlices } = useImportSlicesFromGithub();
  const {
    selectedLocalSlices,
    selectedLibrarySlices,
    reset,
  } = useImportSlicesContext();

  /**
   * Keeps track of the current instance id.
   * When the modal is closed, the id is reset.
   */
  const id = useRef(crypto.randomUUID());

  const onOpenChange = (open: boolean) => {
    if (open || isCreatingSlices) return;
    onClose();
    id.current = crypto.randomUUID();
    reset();
    resetSlices();
  };

  const onSubmit = () => {
    const totalSelected =
      selectedLocalSlices.length + selectedLibrarySlices.length;

    if (totalSelected === 0) {
      toast.error("Please select at least one slice");
      return;
    }

    // Prepare local slices (just extract models)
    const localSliceModels = selectedLocalSlices.map((slice) => slice.model);

    // Prepare library slices for import
    const librarySlicesToImport: NewSlice[] = selectedLibrarySlices.map(
      (slice) => ({
        image: slice.image,
        model: slice.model,
        files: slice.files,
        componentContents: slice.componentContents,
        mocks: slice.mocks,
        screenshots: slice.screenshots,
      }),
    );

    // If there are library slices, create them first
    if (librarySlicesToImport.length > 0) {
      // Ensure ids and names are conflict-free against existing and newly-added slices
      const conflictFreeSlices: NewSlice[] = [];
      const allExistingSlices = [
        ...existingSlices.current,
        ...localSliceModels,
      ];

      for (const s of librarySlicesToImport) {
        const adjustedModel = sliceWithoutConflicts({
          existingSlices: allExistingSlices,
          newSlices: conflictFreeSlices,
          slice: s.model,
        });
        conflictFreeSlices.push({ ...s, model: adjustedModel });
      }

      const currentId = id.current;
      setIsCreatingSlices(true);
      addSlices(conflictFreeSlices)
        .then(async ({ slices: createdSlices, library }) => {
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

          createSliceSuccess(librariesWithMocks);

          // Also update mocks individually to ensure they're in the store
          for (const slice of librarySlicesToImport) {
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

          // Combine local slices with created library slices
          const allSlices = [
            ...localSliceModels,
            ...createdSlices.map((s) => s.model),
          ];

          onSuccess({ slices: allSlices, library });

          setIsCreatingSlices(false);
          id.current = crypto.randomUUID();
          reset();
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
        })
        .catch(() => {
          if (currentId !== id.current) return;
          setIsCreatingSlices(false);
          toast.error("An unexpected error happened while adding slices.");
        });
    } else {
      // Only local slices selected, no need to create anything
      onSuccess({ slices: localSliceModels });
      reset();
    }
  };

  const totalSelected =
    selectedLocalSlices.length + selectedLibrarySlices.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader title="Reuse an existing slice" />
      <DialogContent gap={0}>
        <DialogDescription hidden>
          Select existing slices or import slices from a GitHub repository
        </DialogDescription>
        <Box flexDirection="column" flexGrow={1} minHeight={0}>
          <Box
            display="flex"
            gap={8}
            padding={16}
            border={{ bottom: true }}
          >
            <Tab
              selected={selectedTab === "local"}
              onClick={() => setSelectedTab("local")}
            >
              Local Slices
            </Tab>
            <Tab
              selected={selectedTab === "library"}
              onClick={() => setSelectedTab("library")}
            >
              Library Slices
            </Tab>
          </Box>
          <Box
            flexDirection="column"
            flexGrow={1}
            minHeight={0}
            visibility={selectedTab === "local" ? "visible" : "hidden"}
          >
            <LocalSlicesTab availableSlices={availableSlices} />
          </Box>
          <Box
            flexDirection="column"
            flexGrow={1}
            minHeight={0}
            visibility={selectedTab === "library" ? "visible" : "hidden"}
          >
            <LibrarySlicesTab />
          </Box>
        </Box>

        <DialogActions>
          <DialogCancelButton disabled={isCreatingSlices} />
          <DialogActionButton
            disabled={totalSelected === 0}
            loading={isCreatingSlices}
            onClick={onSubmit}
          >
            {getSubmitButtonLabel(location)} ({totalSelected})
          </DialogActionButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export function ImportSlicesFromLibraryModal(
  props: ImportSlicesFromLibraryModalProps,
) {
  const { open } = props;

  return (
    <ImportSlicesProvider>
      <ImportSlicesFromLibraryModalContent {...props} />
    </ImportSlicesProvider>
  );
}
