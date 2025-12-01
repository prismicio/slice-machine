import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";

import { getState, telemetry } from "@/apiClient";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import type { SliceImport } from "./types";
import { NewSlice } from "./types";
import { addSlices } from "./utils/addSlices";
import { sliceWithoutConflicts } from "./utils/sliceWithoutConflicts";

interface ImportSlicesContextValue {
  selectedLocalSlices: ComponentUI[];
  selectedLibrarySlices: SliceImport[];
  toggleLocalSlice: (slice: ComponentUI) => void;
  toggleLibrarySlice: (slice: SliceImport) => void;
  setAllLibrarySlices: (slices: SliceImport[]) => void;
  reset: () => void;
  submit: (args: {
    existingSlices: React.MutableRefObject<SharedSlice[]>;
    location: "custom_type" | "page_type" | "slices";
    resetSlices: () => void;
  }) => Promise<{ slices: SharedSlice[]; library?: string }>;
  isSubmitting: boolean;
  totalSelected: number;
}

const ImportSlicesContext = createContext<ImportSlicesContextValue | undefined>(
  undefined,
);

interface ImportSlicesProviderProps {
  children: ReactNode;
}

export function ImportSlicesProvider({ children }: ImportSlicesProviderProps) {
  const [localSlices, setSelectedLocalSlices] = useState<ComponentUI[]>([]);
  const [librarySlices, setSelectedLibrarySlices] = useState<SliceImport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { syncChanges } = useAutoSync();
  const { createSliceSuccess, updateSliceMockSuccess } =
    useSliceMachineActions();
  const { completeStep } = useOnboarding();

  /**
   * Keeps track of the current instance id.
   * When the modal is closed, the id is reset.
   */
  const id = useRef(crypto.randomUUID());

  const toggleLocalSlice = useCallback((slice: ComponentUI) => {
    setSelectedLocalSlices((prev) => {
      const isSelected = prev.some((s) => s.model.id === slice.model.id);
      if (isSelected) {
        return prev.filter((s) => s.model.id !== slice.model.id);
      }
      return [...prev, slice];
    });
  }, []);

  const toggleLibrarySlice = useCallback((slice: SliceImport) => {
    setSelectedLibrarySlices((prev) => {
      const isSelected = prev.some((s) => s.model.id === slice.model.id);
      if (isSelected) {
        return prev.filter((s) => s.model.id !== slice.model.id);
      }
      return [...prev, slice];
    });
  }, []);

  const setAllLibrarySlices = useCallback((slices: SliceImport[]) => {
    setSelectedLibrarySlices(slices);
  }, []);

  const reset = useCallback(() => {
    setSelectedLocalSlices([]);
    setSelectedLibrarySlices([]);
    id.current = crypto.randomUUID();
  }, []);

  const submit = useCallback(
    async (args: {
      existingSlices: React.MutableRefObject<SharedSlice[]>;
      location: "custom_type" | "page_type" | "slices";
      resetSlices: () => void;
    }): Promise<{ slices: SharedSlice[]; library?: string }> => {
      const { existingSlices, location, resetSlices } = args;
      const totalSelected = localSlices.length + librarySlices.length;

      if (totalSelected === 0) {
        toast.error("Please select at least one slice");
        throw new Error("No slices selected");
      }

      // Prepare local slices (just extract models)
      const localSliceModels = localSlices.map((slice) => slice.model);

      // Prepare library slices for import
      const librarySlicesToImport: NewSlice[] = librarySlices.map((slice) => ({
        image: slice.image,
        model: slice.model,
        files: slice.files,
        componentContents: slice.componentContents,
        mocks: slice.mocks,
        screenshots: slice.screenshots,
      }));

      // If there are library slices, create them first
      if (librarySlicesToImport.length > 0) {
        // Ensure ids and names are conflict-free against existing and newly-added slices
        const conflictFreeSlices: NewSlice[] = [];
        const allExistingSlices: SharedSlice[] = [
          ...existingSlices.current,
          ...localSliceModels,
        ] as SharedSlice[];

        for (const s of librarySlicesToImport) {
          const adjustedModel = sliceWithoutConflicts({
            existingSlices: allExistingSlices,
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
          const allSlices: SharedSlice[] = [
            ...localSliceModels,
            ...createdSlices.map((s) => s.model),
          ] as SharedSlice[];

          setIsSubmitting(false);
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

          return { slices: allSlices, library };
        } catch (error) {
          if (currentId !== id.current) {
            throw error;
          }
          setIsSubmitting(false);
          toast.error("An unexpected error happened while adding slices.");
          throw error;
        }
      } else {
        // Only local slices selected, no need to create anything
        reset();
        return { slices: localSliceModels as SharedSlice[] };
      }
    },
    [
      localSlices,
      librarySlices,
      syncChanges,
      createSliceSuccess,
      updateSliceMockSuccess,
      completeStep,
      reset,
    ],
  );

  const totalSelected = localSlices.length + librarySlices.length;

  return (
    <ImportSlicesContext.Provider
      value={{
        selectedLocalSlices: localSlices,
        selectedLibrarySlices: librarySlices,
        toggleLocalSlice,
        toggleLibrarySlice,
        setAllLibrarySlices,
        reset,
        submit,
        isSubmitting,
        totalSelected,
      }}
    >
      {children}
    </ImportSlicesContext.Provider>
  );
}

export function useImportSlicesContext() {
  const context = useContext(ImportSlicesContext);
  if (context === undefined) {
    throw new Error(
      "useImportSlicesContext must be used within ImportSlicesProvider",
    );
  }
  return context;
}
